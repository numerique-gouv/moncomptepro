import {
  getEmailDomain,
  isAFreeEmailProvider,
  usesAFreeEmailProvider,
} from '../../services/uses-a-free-email-provider';
import { isEmpty, some, uniqBy } from 'lodash';
import {
  findById as findOrganizationById,
  findByMostUsedEmailDomain,
  findByUserId,
  findByVerifiedEmailDomain,
} from '../../repositories/organization/getters';
import { findById as findUserById } from '../../repositories/user';
import {
  InseeNotActiveError,
  InseeUnexpectedError,
  InvalidSiretError,
  NotFoundError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserNotFoundError,
} from '../../errors';
import {
  addAuthorizedDomain,
  linkUserToOrganization,
  upsert,
} from '../../repositories/organization/setters';
import { getOrganizationInfo } from '../../connectors/api-sirene';
import {
  createModeration,
  findPendingModeration,
} from '../../repositories/moderation';
import {
  hasLessThanFiftyEmployees,
  isCollectiviteTerritoriale,
  isEntrepriseUnipersonnelle,
} from '../../services/organization';
import { getContactEmail } from '../../connectors/api-annuaire-service-public';
import * as Sentry from '@sentry/node';
import { isEmailValid } from '../../services/security';
import { markDomainAsVerified } from './main';
import { sendMail } from '../../connectors/sendinblue';
import { SUPPORT_EMAIL_ADDRESS } from '../../env';

export const doSuggestOrganizations = async ({
  user_id,
  email,
}: {
  user_id: number;
  email: string;
}): Promise<boolean> => {
  if (usesAFreeEmailProvider(email)) {
    return false;
  }

  const domain = getEmailDomain(email);
  const organizationsSuggestions = uniqBy(
    [
      ...(await findByVerifiedEmailDomain(domain)),
      ...(await findByMostUsedEmailDomain(domain)),
    ],
    'id'
  );
  const userOrganizations = await findByUserId(user_id);

  return isEmpty(userOrganizations) && !isEmpty(organizationsSuggestions);
};
export const getOrganizationSuggestions = async ({
  user_id,
  email,
}: {
  user_id: number;
  email: string;
}): Promise<Organization[]> => {
  if (usesAFreeEmailProvider(email)) {
    return [];
  }

  const domain = getEmailDomain(email);

  const organizationsSuggestions = uniqBy(
    [
      ...(await findByVerifiedEmailDomain(domain)),
      ...(await findByMostUsedEmailDomain(domain)),
    ],
    'id'
  );
  const userOrganizations = await findByUserId(user_id);
  const userOrganizationsIds = userOrganizations.map(({ id }) => id);

  return organizationsSuggestions.filter(
    ({ id }) => !userOrganizationsIds.includes(id)
  );
};
export const joinOrganization = async ({
  siret,
  user_id,
}: {
  siret: string;
  user_id: number;
}): Promise<UserOrganizationLink> => {
  // Update organizationInfo
  let organizationInfo: OrganizationInfo;
  try {
    organizationInfo = await getOrganizationInfo(siret);
  } catch (error) {
    if (error instanceof InseeUnexpectedError) {
      throw error;
    }

    throw new InvalidSiretError();
  }
  let organization = await upsert({
    siret,
    organizationInfo,
  });

  // Ensure Organization is active
  if (!organization.cached_est_active) {
    throw new InseeNotActiveError();
  }

  // Ensure user_id is valid
  const user = await findUserById(user_id);
  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  const usersOrganizations = await findByUserId(user_id);
  if (some(usersOrganizations, ['id', organization.id])) {
    throw new UserInOrganizationAlreadyError();
  }

  const pendingModeration = await findPendingModeration({
    user_id,
    organization_id: organization.id,
    type: 'organization_join_block',
  });
  if (!isEmpty(pendingModeration)) {
    throw new UserAlreadyAskedToJoinOrganizationError();
  }

  const {
    id: organization_id,
    cached_libelle,
    authorized_email_domains,
    verified_email_domains,
    external_authorized_email_domains,
  } = organization;
  const { email, given_name, family_name } = user;
  const domain = getEmailDomain(email);

  if (isEntrepriseUnipersonnelle(organization)) {
    if (!usesAFreeEmailProvider(email)) {
      await addAuthorizedDomain({ siret, domain });
    }

    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: null,
    });
  }

  if (isCollectiviteTerritoriale(organization)) {
    let contactEmail;
    try {
      contactEmail = await getContactEmail(
        organization.cached_code_officiel_geographique
      );
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    }

    if (isEmailValid(contactEmail)) {
      const contactDomain = getEmailDomain(contactEmail);

      if (!isAFreeEmailProvider(contactDomain)) {
        await markDomainAsVerified({
          organization_id,
          domain: contactDomain,
          verification_type: 'official_contact_domain',
        });
      }

      if (contactEmail === email) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: 'official_contact_email',
        });
      }

      if (!isAFreeEmailProvider(contactDomain) && contactDomain === domain) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: 'official_contact_domain',
        });
      }

      if (
        (isAFreeEmailProvider(contactDomain) ||
          hasLessThanFiftyEmployees(organization)) &&
        isAFreeEmailProvider(domain)
      ) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: null,
          needs_official_contact_email_verification: true,
        });
      }
    }
  }

  if (verified_email_domains.includes(domain)) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: 'verified_email_domain',
    });
  }

  if (external_authorized_email_domains.includes(domain)) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      is_external: true,
      verification_type: 'verified_email_domain',
    });
  }

  if (authorized_email_domains.includes(domain)) {
    await createModeration({
      user_id,
      organization_id,
      type: 'non_verified_domain',
    });
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: null,
    });
  }

  await createModeration({
    user_id,
    organization_id,
    type: 'organization_join_block',
  });
  await sendMail({
    to: [email],
    cc: [SUPPORT_EMAIL_ADDRESS],
    subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle || siret}`,
    template: 'unable-to-auto-join-organization',
    params: {
      libelle: cached_libelle || siret,
    },
  });
  throw new UnableToAutoJoinOrganizationError();
};
export const forceJoinOrganization = async ({
  organization_id,
  user_id,
  is_external = false,
}: {
  organization_id: number;
  user_id: number;
  is_external?: boolean;
}) => {
  const user = await findUserById(user_id);
  const organization = await findOrganizationById(organization_id);
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }
  const { email } = user;
  const { verified_email_domains, external_authorized_email_domains } =
    organization;

  const domain = getEmailDomain(email);
  const verification_type =
    verified_email_domains.includes(domain) ||
    external_authorized_email_domains.includes(domain)
      ? 'verified_email_domain'
      : null;

  return await linkUserToOrganization({
    organization_id,
    user_id,
    is_external,
    verification_type,
  });
};
