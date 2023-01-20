import { isEmpty, some } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import { sendMail } from '../connectors/sendinblue';
import {
  InseeNotFoundError,
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
  create,
  deleteUserOrganisation,
  findByEmailDomain,
  findBySiret,
  findByUserId,
  findPendingByUserId,
  getUsers,
  updateOrganizationInfo,
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

    if (!organizationInfo.estActive) {
      // A : Actif;
      // see: https://www.sirene.fr/sirene/public/variable/etatAdministratifEtablissement
      throw new Error('organization is not active');
    }
  } catch (error) {
    console.error(error);

    if (error instanceof InseeNotFoundError) {
      throw new Error('invalid response from sirene API');
    }

    if (error instanceof InseeTimeoutError) {
      throw error;
    }

    throw new InvalidSiretError();
  }
  const { libelle, trancheEffectifs } = organizationInfo;

  // Ensure user_id is valid
  const user = await findUserById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  // Ensure user can join organization automatically
  const { email, given_name, family_name } = user;
  const emailDomain = getEmailDomain(email);
  let organization = await findBySiret(siret);

  // Update organizationInfo
  if (!isEmpty(organization)) {
    organization = await updateOrganizationInfo({
      id: organization.id,
      organizationInfo,
    });
  }

  if (
    !isEmpty(organization) &&
    (is_external
      ? !organization.external_authorized_email_domains.includes(emailDomain)
      : !organization.authorized_email_domains.includes(emailDomain))
  ) {
    await sendMail({
      to: [email],
      cc: ['moncomptepro@beta.gouv.fr'],
      subject: `[MonComptePro] Demande pour rejoindre ${libelle}`,
      template: 'unable-to-auto-join-organization',
      params: {
        libelle,
      },
    });

    await createOrganizationJoinBlockModeration({
      user_id,
      organization_id: organization.id,
      as_external: is_external,
    });

    // @ts-ignore this might be fixed in a future refactor of this function
    throw new UnableToAutoJoinOrganizationError(organization.cached_libelle);
  }

  // Create organization if needed
  if (isEmpty(organization)) {
    organization = await create({
      siret,
      organizationInfo,
      authorized_email_domains: is_external ? [] : [emailDomain],
      external_authorized_email_domains: is_external ? [emailDomain] : [],
    });
  }

  // Ensure user is not in organization already
  const usersInOrganizationAlready = await getUsers(organization.id);
  if (
    !isEmpty(organization) &&
    some(usersInOrganizationAlready, ['email', email])
  ) {
    throw new UserInOrganizationAlreadyError();
  }

  // Link user to organization
  await addUser({
    organization_id: organization.id,
    user_id,
    is_external,
  });

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
      params: { user_label, libelle, email, is_external },
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
        libelle,
        usersInOrganizationAlready,
      },
    });
  }

  // Notify administrators if someone joined an organization with more than 50 employees
  // see https://www.sirene.fr/sirene/public/variable/tefen
  if (
    ['21', '22', '31', '32', '41', '42', '51', '52', '53'].includes(
      trancheEffectifs
    )
  ) {
    await createBigOrganizationJoinModeration({
      user_id,
      organization_id: organization.id,
      as_external: is_external,
    });
  }

  return true;
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
