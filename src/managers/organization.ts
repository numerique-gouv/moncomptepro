import { isEmpty, some, uniqBy } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import { sendMail } from '../connectors/sendinblue';
import {
  InseeNotActiveError,
  InseeTimeoutError,
  InvalidSiretError,
  NotFoundError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserNotFoundError,
} from '../errors';
import { createModeration } from '../repositories/moderation';
import { findById as findUserById } from '../repositories/user';
import {
  getEmailDomain,
  isAFreeEmailProvider,
  usesAFreeEmailProvider,
} from '../services/uses-a-free-email-provider';
import {
  isCollectiviteTerritoriale,
  isEntrepriseUnipersonnelle,
} from '../services/organization';
import { getContactEmail } from '../connectors/api-annuaire';
import * as Sentry from '@sentry/node';
import {
  findById as findOrganizationById,
  findByMostUsedEmailDomain,
  findByUserId,
  findByVerifiedEmailDomain,
  findPendingByUserId,
  getUsers,
} from '../repositories/organization/getters';
import {
  addAuthorizedDomain,
  addVerifiedDomain,
  deleteUserOrganization,
  linkUserToOrganization,
  setVerificationType,
  upsert,
} from '../repositories/organization/setters';
import { isEmailValid } from '../services/security';

const { SUPPORT_EMAIL_ADDRESS = 'moncomptepro@beta.gouv.fr' } = process.env;

export const getOrganizationsByUserId = findByUserId;

export const getUserOrganizations = async ({
  user_id,
}: {
  user_id: number;
}): Promise<{
  userOrganizations: Organization[];
  pendingUserOrganizations: Organization[];
}> => {
  const userOrganizations = await findByUserId(user_id);
  const pendingUserOrganizations = await findPendingByUserId(user_id);

  return { userOrganizations, pendingUserOrganizations };
};

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
    if (error instanceof InseeTimeoutError) {
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

  const pendingUsersOrganizations = await findPendingByUserId(user_id);
  if (some(pendingUsersOrganizations, ['id', organization.id])) {
    throw new UserAlreadyAskToJoinOrganizationError();
  }

  const {
    id: organization_id,
    cached_libelle,
    authorized_email_domains,
    verified_email_domains,
    external_authorized_email_domains,
  } = organization;
  const { email } = user;
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
  const {
    verified_email_domains,
    external_authorized_email_domains,
  } = organization;

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

export const notifyOrganizationJoin = async ({
  organization_id,
  user_id,
  is_external,
}: UserOrganizationLink) => {
  const user = await findUserById(user_id);
  const organization = await findOrganizationById(organization_id);
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }
  const { email, given_name, family_name } = user;
  const { cached_libelle } = organization;

  // Email organization members of the organization
  const usersInOrganization = await getUsers(organization_id);
  const otherInternalUsers = usersInOrganization.filter(
    ({ email: e, is_external }) => e !== email && !is_external
  );
  if (otherInternalUsers.length > 0) {
    const user_label =
      !given_name && !family_name ? email : `${given_name} ${family_name}`;
    await sendMail({
      to: otherInternalUsers.map(({ email }) => email),
      subject: 'Votre organisation sur MonComptePro',
      template: 'join-organization',
      params: { user_label, libelle: cached_libelle, email, is_external },
    });
  }

  // Email organization members list to the user (if he is an internal member)
  const otherUsers = usersInOrganization.filter(({ email: e }) => e !== email);
  if (!is_external && otherUsers.length > 0) {
    await sendMail({
      to: [email],
      subject: 'Votre organisation sur MonComptePro',
      template: 'organization-welcome',
      params: {
        given_name,
        family_name,
        libelle: cached_libelle,
        otherUsers,
      },
    });
  }
};

/**
 * This function send a welcome email if user is in one organization only.
 * As a consequence, the first organization should be joined before calling it.
 * @param user_id
 */
export const greetFirstOrganizationJoin = async ({
  user_id,
}: {
  user_id: number;
}): Promise<{ greetEmailSent: boolean }> => {
  const userOrganizations = await getOrganizationsByUserId(user_id);

  if (userOrganizations.length !== 1) {
    return { greetEmailSent: false };
  }

  const { given_name, family_name, email } = (await findUserById(user_id))!;

  // Welcome the user when he joins is first organization as he may now be able to connect
  await sendMail({
    to: [email],
    subject: 'Votre compte MonComptePro a bien été créé',
    template: 'welcome',
    params: { given_name, family_name, email },
  });

  return { greetEmailSent: true };
};

export const quitOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  await deleteUserOrganization({ user_id, organization_id });

  return null;
};

export const markDomainAsVerified = async ({
  organization_id,
  domain,
  verification_type,
}: {
  organization_id: number;
  domain: string;
  verification_type: UserOrganizationLink['verification_type'];
}) => {
  const organization = await findOrganizationById(organization_id);
  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const {
    siret,
    verified_email_domains,
    authorized_email_domains,
  } = organization;

  if (!verified_email_domains.includes(domain)) {
    await addVerifiedDomain({ siret, domain });
  }

  if (!authorized_email_domains.includes(domain)) {
    await addAuthorizedDomain({ siret, domain });
  }

  const usersInOrganization = await getUsers(organization_id);

  await Promise.all(
    usersInOrganization.map(
      async ({ id, email, verification_type: current_verification_type }) => {
        const userDomain = getEmailDomain(email);
        if (userDomain === domain && isEmpty(current_verification_type)) {
          return await setVerificationType({
            organization_id,
            user_id: id,
            verification_type,
          });
        }

        return null;
      }
    )
  );
};
