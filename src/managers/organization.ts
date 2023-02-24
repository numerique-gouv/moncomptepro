import { isEmpty, some, uniqBy } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import { sendMail } from '../connectors/sendinblue';
import {
  InseeNotActiveError,
  InseeTimeoutError,
  InvalidSiretError,
  UnableToAutoJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserNotFoundError,
} from '../errors';
import { createModeration } from '../repositories/moderation';
import {
  addUser,
  deleteUserOrganisation,
  findByMostUsedEmailDomain,
  findByUserId,
  findPendingByUserId,
  getUsers,
  upsert,
  addAuthorizedDomain,
  findByVerifiedEmailDomain,
} from '../repositories/organization';
import { findById as findUserById } from '../repositories/user';
import {
  getEmailDomain,
  usesAFreeEmailProvider,
} from '../services/uses-a-free-email-provider';
import { isEntrepriseUnipersonnelle } from '../services/organization';

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
}) => {
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

  // Ensure user is not in organization already
  const usersInOrganizationAlready = await getUsers(organization.id);
  if (some(usersInOrganizationAlready, ['email', user.email])) {
    throw new UserInOrganizationAlreadyError();
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
    await addUser({
      organization_id,
      user_id,
    });

    if (!usesAFreeEmailProvider(email)) {
      await addAuthorizedDomain({ siret, domain });
    }
  } else if (verified_email_domains.includes(domain)) {
    await addUser({
      organization_id,
      user_id,
      verification_type: 'verified_email_domain',
    });
  } else if (external_authorized_email_domains.includes(domain)) {
    await addUser({
      organization_id,
      user_id,
      is_external: true,
      verification_type: 'verified_email_domain',
    });
  } else if (authorized_email_domains.includes(domain)) {
    await addUser({
      organization_id,
      user_id,
    });
    await createModeration({
      user_id,
      organization_id,
      type: 'non_verified_domain',
    });
  } else {
    await sendMail({
      to: [email],
      cc: [SUPPORT_EMAIL_ADDRESS],
      subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle ||
        siret}`,
      template: 'unable-to-auto-join-organization',
      params: {
        libelle: cached_libelle || siret,
      },
    });
    await createModeration({
      user_id,
      organization_id,
      type: 'organization_join_block',
    });
    throw new UnableToAutoJoinOrganizationError(cached_libelle || siret);
  }

  // Email existing user in the organization
  const usersInOrganization = await getUsers(organization.id);
  const otherInternalUsers = usersInOrganization.filter(
    ({ email: e, is_external }) => e !== email && !is_external
  );
  const is_external = usersInOrganization.find(({ email: e }) => e === email)!
    .is_external;
  const { given_name, family_name } = user;
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

  // Inform internal users of members already in the organization
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
  await deleteUserOrganisation({ user_id, organization_id });

  return null;
};
