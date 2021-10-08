import { isEmpty, some } from 'lodash';
import axios from 'axios';

import {
  findBySiret,
  findByUserId,
  create,
  addUser,
  getUsers,
} from '../repositories/organization';
import { isSiretValid } from '../services/security';
import { findById as findUserById } from '../repositories/user';
import { sendMail } from '../managers/mail';
import {
  createBigOrganizationJoinModeration,
  createOrganizationJoinBlockModeration,
} from '../repositories/moderation';

export const joinOrganization = async (siret, user_id, is_external) => {
  // Ensure siret is valid
  if (!isSiretValid(siret)) {
    throw new Error('invalid_siret');
  }

  const siretNoSpaces = siret.replace(/\s/g, '');
  let nom_raison_sociale = null;
  let tranche_effectifs = null;

  try {
    const {
      data: { etablissement },
    } = await axios({
      method: 'get',
      url: `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siretNoSpaces}`,
    });

    const siretFromSireneApi = etablissement.siret;
    nom_raison_sociale = etablissement.unite_legale.denomination;
    tranche_effectifs = etablissement.tranche_effectifs;

    if (siretFromSireneApi !== siretNoSpaces) {
      throw new Error('invalid response from sirene API');
    }

    if (etablissement.etat_administratif !== 'A') {
      // A : Actif;
      // see: https://www.sirene.fr/sirene/public/variable/etatAdministratifEtablissement
      throw new Error('organization is not active');
    }
  } catch (error) {
    console.error(error);

    throw new Error('invalid_siret');
  }

  // Ensure user_id is valid
  const user = await findUserById(user_id);

  if (isEmpty(user)) {
    throw new Error('user_not_found');
  }

  // Ensure user can join organization automatically
  const { email, given_name, family_name } = user;
  const emailDomain = email.split('@').pop();
  let organization = await findBySiret(siretNoSpaces);

  if (
    !isEmpty(organization) &&
    (is_external
      ? !organization.external_authorized_email_domains.includes(emailDomain)
      : !organization.authorized_email_domains.includes(emailDomain))
  ) {
    await sendMail({
      to: [email],
      cc: ['auth@api.gouv.fr'],
      subject: `[api.gouv.fr] Demande pour rejoindre ${nom_raison_sociale}`,
      template: 'unable-to-auto-join-organization-acknowledgment',
      params: {
        nom_raison_sociale,
      },
    });

    await createOrganizationJoinBlockModeration({
      user_id,
      organization_id: organization.id,
      as_external: is_external,
    });

    throw new Error('unable_to_auto_join_organization');
  }

  // Create organization if needed
  if (isEmpty(organization)) {
    organization = await create({
      siret: siretNoSpaces,
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
    throw new Error('user_in_organization_already');
  }

  // Link user to organization
  await addUser({
    organization_id: organization.id,
    user_id,
    is_external,
  });

  const userOrganizations = await getOrganizationsByUserId(user_id);
  if (userOrganizations.length === 1) {
    // Welcome the user when he join is first organization as he may now be able to connect
    await sendMail({
      to: [email],
      subject: 'Votre compte api.gouv.fr a bien été créé',
      template: 'welcome',
      params: { given_name, family_name, email },
    });
  }

  const user_label =
    !given_name && !family_name ? email : `${given_name} ${family_name}`;
  const usersInOrganizationAlreadyWithoutExternal =
    usersInOrganizationAlready.filter(({ is_external }) => !is_external);
  if (usersInOrganizationAlreadyWithoutExternal.length > 0) {
    await sendMail({
      to: usersInOrganizationAlreadyWithoutExternal.map(({ email }) => email),
      subject: 'Votre organisation sur api.gouv.fr',
      template: 'join-organization',
      params: { user_label, nom_raison_sociale, email, is_external },
    });
  }

  // Inform internal users of members already in the organization
  if (!is_external && usersInOrganizationAlready.length > 0) {
    await sendMail({
      to: [email],
      subject: 'Votre organisation sur api.gouv.fr',
      template: 'organization-welcome',
      params: {
        given_name,
        family_name,
        nom_raison_sociale,
        usersInOrganizationAlready,
      },
    });
  }

  // Notify administrators if someone joined an organization with more than 50 employees
  // see https://www.sirene.fr/sirene/public/variable/tefen
  if (
    ['21', '22', '31', '32', '41', '42', '51', '52', '53'].includes(
      tranche_effectifs
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

export const getOrganizationsByUserId = findByUserId;
