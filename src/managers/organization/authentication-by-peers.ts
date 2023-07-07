import {
  findById as findOrganizationById,
  getUserOrganizationLink,
  getUsers,
} from '../../repositories/organization/getters';
import { isEmpty } from 'lodash';
import { findById as findUserById } from '../../repositories/user';
import {
  NotFoundError,
  UserAlreadyAskedForSponsorshipError,
} from '../../errors';
import { isEligibleToSponsorship } from '../../services/organization';
import { sendMail } from '../../connectors/sendinblue';
import { updateUserOrganizationLink } from '../../repositories/organization/setters';
import { getOrganizationsByUserId } from './main';
import {
  createModeration,
  findPendingModeration,
} from '../../repositories/moderation';
import { SUPPORT_EMAIL_ADDRESS } from '../../env';

export const authenticateByPeers = async (
  link: UserOrganizationLink
): Promise<{ hasBeenAuthenticated: boolean }> => {
  const { organization_id, user_id, is_external } = link;
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  if (isEligibleToSponsorship(organization)) {
    return { hasBeenAuthenticated: false };
  }

  await notifyAllMembers(link);

  return { hasBeenAuthenticated: true };
};
export const notifyAllMembers = async ({
  organization_id,
  user_id,
  is_external,
}: UserOrganizationLink) => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { email, given_name, family_name } = user;
  const { cached_libelle } = organization;

  // Email organization members of the organization
  const usersInOrganization = await getUsers(organization_id);
  const otherInternalUsers = usersInOrganization.filter(
    ({ email: e, is_external, authentication_by_peers_type }) =>
      e !== email && !is_external && !!authentication_by_peers_type
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

  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type: 'all_members_notified',
  });
};
export const greetForJoiningOrganization = async ({
  user_id,
}: {
  user_id: number;
}): Promise<{ greetEmailSentFor: number | null }> => {
  const userOrganisations = await getOrganizationsByUserId(user_id);

  const organizationThatNeedsGreetings = userOrganisations.find(
    ({ has_been_greeted }) => !has_been_greeted
  );

  const { given_name, family_name, email } = (await findUserById(user_id))!;

  if (isEmpty(organizationThatNeedsGreetings)) {
    return { greetEmailSentFor: null };
  }

  const { id: organization_id } = organizationThatNeedsGreetings;

  // Welcome the user when he joins is first organization as he may now be able to connect
  await sendMail({
    to: [email],
    subject: 'Votre compte MonComptePro a bien été créé',
    template: 'welcome',
    params: { given_name, family_name, email },
  });

  await updateUserOrganizationLink(organization_id, user_id, {
    has_been_greeted: true,
  });

  return { greetEmailSentFor: organization_id };
};
export const getSponsorOptions = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);

  // The user should be in the organization already
  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  // Note that external user will have access to name and job of internal members
  const sponsorOptions: {
    id: number;
    label: string;
  }[] = organizationUsers
    .filter(
      ({ is_external, authentication_by_peers_type }) =>
        !is_external && !!authentication_by_peers_type
    )
    .map(({ id, given_name, family_name, job }) => ({
      id,
      label: `${given_name} ${family_name} - ${job}`,
    }))
    .sort(({ label: aLabel }, { label: bLabel }) => (aLabel < bLabel ? -1 : 1));

  return sponsorOptions;
};
export const chooseSponsor = async ({
  user_id,
  organization_id,
  sponsor_id,
}: {
  user_id: number;
  organization_id: number;
  sponsor_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const organization = await findOrganizationById(organization_id);

  const user = organizationUsers.find(({ id }) => id === user_id);
  const sponsor = organizationUsers.find(({ id }) => id === sponsor_id);

  // The sponsor and the user should be in the organization already
  if (isEmpty(user) || isEmpty(sponsor) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  // The sponsor must be an authenticated internal member.
  if (!sponsor.authentication_by_peers_type || sponsor.is_external) {
    throw new NotFoundError();
  }

  // Note that the user may already be authenticated by his peers.
  await sendMail({
    to: [sponsor.email],
    subject: 'Nouveau membre dans votre organisation MonComptePro',
    template: 'choose-sponsor',
    params: {
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
      libelle: organization.cached_libelle,
      user_id,
      organization_id,
      sponsor_id,
    },
  });

  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type: 'sponsored_by_member',
    sponsor_id,
  });
};
export const getSponsorLabel = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const link = await getUserOrganizationLink(organization_id, user_id);

  if (isEmpty(link)) {
    return null;
  }

  const { sponsor_id } = link;

  if (!sponsor_id) {
    return null;
  }

  const sponsor = await findUserById(sponsor_id);

  if (isEmpty(sponsor)) {
    return null;
  }

  const { given_name, family_name } = sponsor;

  return `${given_name} ${family_name}`;
};
export const getOrganizationLabel = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const organization = await findOrganizationById(organization_id);

  const user = organizationUsers.find(({ id }) => id === user_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  return organization.cached_libelle;
};
export const askForSponsorship = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const organization = await findOrganizationById(organization_id);

  const user = organizationUsers.find(({ id }) => id === user_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  const pendingModeration = await findPendingModeration({
    user_id,
    organization_id,
    type: 'ask_for_sponsorship',
  });
  if (!isEmpty(pendingModeration)) {
    throw new UserAlreadyAskedForSponsorshipError(organization_id);
  }

  await createModeration({
    user_id,
    organization_id,
    type: 'ask_for_sponsorship',
  });
  const { email, given_name, family_name } = user;
  const { cached_libelle, siret } = organization;
  await sendMail({
    to: [email],
    cc: [SUPPORT_EMAIL_ADDRESS],
    subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle || siret}`,
    template: 'unable-to-find-sponsor',
    params: {
      given_name,
      family_name,
      libelle: cached_libelle || siret,
    },
  });
};
