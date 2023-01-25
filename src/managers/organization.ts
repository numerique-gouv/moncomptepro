import { isEmpty, some } from 'lodash';
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
import {
  createBigOrganizationJoinModeration,
  createOrganizationJoinBlockModeration,
} from '../repositories/moderation';
import {
  addUser,
  updateDomains,
  deleteUserOrganisation,
  findByEmailDomain,
  findByUserId,
  findPendingByUserId,
  getUsers,
  upsert,
} from '../repositories/organization';
import { findById as findUserById } from '../repositories/user';
import {
  getEmailDomain,
  usesAFreeEmailProvider,
} from '../services/uses-a-free-email-provider';

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
  const organizationsSuggestions = await findByEmailDomain(domain);
  const userOrganizations = await getOrganizationsByUserId(user_id);

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

  const organizationsSuggestions = await findByEmailDomain(domain);
  const userOrganizations = await findByUserId(user_id);
  const userOrganizationsIds = userOrganizations.map(({ id }) => id);

  return organizationsSuggestions.filter(
    ({ id }) => !userOrganizationsIds.includes(id)
  );
};

export const joinOrganization = async ({
  siret,
  user_id,
  is_external,
}: {
  siret: string;
  user_id: number;
  is_external: boolean;
}) => {
  let organizationInfo: OrganizationInfo;

  try {
    organizationInfo = await getOrganizationInfo(siret);
  } catch (error) {
    if (error instanceof InseeTimeoutError) {
      throw error;
    }

    throw new InvalidSiretError();
  }

  // Update organizationInfo
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
    cached_libelle,
    authorized_email_domains,
    external_authorized_email_domains,
  } = organization;
  const { email } = user;
  const emailDomain = getEmailDomain(email);

  // Set emailDomain if user is the first organization member
  if (
    isEmpty(authorized_email_domains) &&
    isEmpty(external_authorized_email_domains)
  ) {
    organization = await updateDomains({
      siret,
      authorized_email_domains: is_external ? [] : [emailDomain],
      external_authorized_email_domains: is_external ? [emailDomain] : [],
    });
  } else if (
    // Ensure user can join organization automatically
    is_external
      ? !external_authorized_email_domains.includes(emailDomain)
      : !authorized_email_domains.includes(emailDomain)
  ) {
    await sendMail({
      to: [email],
      cc: ['moncomptepro@beta.gouv.fr'],
      subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle ||
        siret}`,
      template: 'unable-to-auto-join-organization',
      params: {
        libelle: cached_libelle || siret,
      },
    });

    await createOrganizationJoinBlockModeration({
      user_id,
      organization_id: organization.id,
      as_external: is_external,
    });

    throw new UnableToAutoJoinOrganizationError(cached_libelle || siret);
  }

  // Link user to organization
  await addUser({
    organization_id: organization.id,
    user_id,
    is_external,
  });

  const { given_name, family_name } = user;
  const user_label =
    !given_name && !family_name ? email : `${given_name} ${family_name}`;
  const usersInOrganizationAlreadyWithoutExternal = usersInOrganizationAlready.filter(
    ({ is_external }) => !is_external
  );
  if (usersInOrganizationAlreadyWithoutExternal.length > 0) {
    await sendMail({
      to: usersInOrganizationAlreadyWithoutExternal.map(({ email }) => email),
      subject: 'Votre organisation sur MonComptePro',
      template: 'join-organization',
      params: { user_label, libelle: cached_libelle, email, is_external },
    });
  }

  // Inform internal users of members already in the organization
  if (!is_external && usersInOrganizationAlready.length > 0) {
    await sendMail({
      to: [email],
      subject: 'Votre organisation sur MonComptePro',
      template: 'organization-welcome',
      params: {
        given_name,
        family_name,
        libelle: cached_libelle,
        usersInOrganizationAlready,
      },
    });
  }

  // Notify administrators if someone joined an organization with more than 50 employees
  // see https://www.sirene.fr/sirene/public/variable/tefen
  if (
    organization.cached_tranche_effectifs &&
    ['21', '22', '31', '32', '41', '42', '51', '52', '53'].includes(
      organization.cached_tranche_effectifs
    )
  ) {
    await createBigOrganizationJoinModeration({
      user_id,
      organization_id: organization.id,
      as_external: is_external,
    });
  }
};

export const greetFirstOrganizationJoin = async ({
  user_id,
}: {
  user_id: number;
}) => {
  const userOrganizations = await getOrganizationsByUserId(user_id);

  if (userOrganizations.length !== 1) {
    return false;
  }

  const { given_name, family_name, email } = (await findUserById(
    user_id
  )) as User;

  // Welcome the user when he joins is first organization as he may now be able to connect
  await sendMail({
    to: [email],
    subject: 'Votre compte MonComptePro a bien été créé',
    template: 'welcome',
    params: { given_name, family_name, email },
  });

  return true;
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
