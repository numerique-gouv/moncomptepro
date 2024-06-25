import { isEmpty, sampleSize } from "lodash-es";
import { NOTIFY_ALL_MEMBER_LIMIT } from "../../config/env";
import {
  NotFoundError,
  UserHasAlreadyBeenAuthenticatedByPeers,
} from "../../config/errors";
import { sendMail } from "../../connectors/brevo";
import {
  findById as findOrganizationById,
  getActiveUsers,
  getInternalActiveUsers,
  getUserOrganizationLink,
  getUsers,
} from "../../repositories/organization/getters";
import { updateUserOrganizationLink } from "../../repositories/organization/setters";
import { findById as findUserById } from "../../repositories/user";
import { getOrganizationsByUserId } from "./main";

export const notifyAllMembers = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  // The user has already notified all members
  if (user.authentication_by_peers_type) {
    throw new UserHasAlreadyBeenAuthenticatedByPeers();
  }

  const { email, given_name, family_name, is_external } = user;
  const { cached_libelle } = organization;

  // Email organization members of the organization
  const internalActiveUsers = await getInternalActiveUsers(organization_id);
  const otherInternalUsers = internalActiveUsers.filter(
    ({ email: e }) => e !== email,
  );

  let authentication_by_peers_type: BaseUserOrganizationLink["authentication_by_peers_type"];
  if (otherInternalUsers.length > 0) {
    const user_label =
      !given_name && !family_name ? email : `${given_name} ${family_name}`;
    const otherInternalUsersSample = sampleSize(
      otherInternalUsers,
      NOTIFY_ALL_MEMBER_LIMIT,
    );
    await sendMail({
      to: otherInternalUsersSample.map(({ email }) => email),
      subject: "Votre organisation sur MonComptePro",
      template: "join-organization",
      params: {
        user_label,
        libelle: cached_libelle,
        email,
        is_external: is_external,
      },
      senderEmail: "notifications@moncomptepro.beta.gouv.fr",
    });

    authentication_by_peers_type = "all_members_notified";
  } else {
    authentication_by_peers_type = "is_the_only_active_member";
  }

  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type,
  });
};

export const markAsWhitelisted = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type: "deactivated_by_whitelist",
  });
};

export const markAsGouvFrDomain = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type: "deactivated_by_gouv_fr_domain",
  });
};

export const greetForJoiningOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganisations = await getOrganizationsByUserId(user_id);
  const organization = userOrganisations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { given_name, family_name, email } = (await findUserById(user_id))!;
  const { cached_libelle, is_external } = organization;

  // Welcome the user when he joins is first organization as he may now be able to connect
  await sendMail({
    to: [email],
    subject: "Votre compte MonComptePro a bien été créé",
    template: "welcome",
    params: { given_name, family_name, email },
  });

  // Email organization members list to the user (if he is an internal member)
  const usersInOrganization = await getActiveUsers(organization_id);
  const otherUsers = usersInOrganization.filter(
    ({ email: e, authentication_by_peers_type }) =>
      e !== email && !!authentication_by_peers_type,
  );
  if (!is_external && otherUsers.length > 0) {
    await sendMail({
      to: [email],
      subject: "Votre organisation sur MonComptePro",
      template: "organization-welcome",
      params: {
        given_name,
        family_name,
        libelle: cached_libelle,
        otherUsers,
      },
    });
  }

  return await updateUserOrganizationLink(organization_id, user_id, {
    has_been_greeted: true,
  });
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

  const internalActiveUsers = await getInternalActiveUsers(organization_id);
  // Note that external user will have access to name and job of internal members
  const sponsorOptions: {
    id: number;
    label: string;
  }[] = internalActiveUsers
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
  const organization = await findOrganizationById(organization_id);

  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);

  const internalActiveUsers = await getInternalActiveUsers(organization_id);
  const sponsor = internalActiveUsers.find(({ id }) => id === sponsor_id);

  // The user should be in the organization already
  // The sponsor must be an authenticated internal member.
  if (isEmpty(user) || isEmpty(sponsor) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  // The user has already been sponsored
  if (user.authentication_by_peers_type) {
    throw new UserHasAlreadyBeenAuthenticatedByPeers();
  }

  await sendMail({
    to: [sponsor.email],
    subject: "Connaissez-vous ce nouveau membre ?",
    template: "choose-sponsor",
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

  // Note that this will allow the user to connect no matter the sponsor decision.
  // We email the sponsor only for him to be notified.
  // We log the sponsor decision, it has no influence on the user being able to connect for now.
  return await updateUserOrganizationLink(organization_id, user_id, {
    authentication_by_peers_type: "sponsored_by_member",
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
