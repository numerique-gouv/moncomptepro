import { isEmpty, some, uniqBy } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import { sendMail } from '../connectors/sendinblue';
import {
  InseeNotActiveError,
  InseeTimeoutError,
  InvalidSiretError,
  NotFoundError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedForSponsorshipError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserNotFoundError,
} from '../errors';
import {
  createModeration,
  findPendingModeration,
} from '../repositories/moderation';
import { findById as findUserById } from '../repositories/user';
import {
  getEmailDomain,
  isAFreeEmailProvider,
  usesAFreeEmailProvider,
} from '../services/uses-a-free-email-provider';
import {
  isCollectiviteTerritoriale,
  isEligibleToSponsorship,
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
  getUserOrganizationLink,
  getUsers,
} from '../repositories/organization/getters';
import {
  addAuthorizedDomain,
  addVerifiedDomain,
  deleteUserOrganization,
  linkUserToOrganization,
  updateUserOrganizationLink,
  upsert,
} from '../repositories/organization/setters';
import { isEmailValid } from '../services/security';

const { SUPPORT_EMAIL_ADDRESS = 'moncomptepro@beta.gouv.fr' } = process.env;

export const getOrganizationsByUserId = findByUserId;
export const getOrganizationById = findOrganizationById;

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
    .sort(({ label: aLabel }, { label: bLabel }) => (aLabel < bLabel ? 1 : -1));

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
          return await updateUserOrganizationLink(organization_id, id, {
            verification_type,
          });
        }

        return null;
      }
    )
  );
};
