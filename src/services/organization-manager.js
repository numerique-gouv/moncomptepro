import {
  findBySiret,
  findByUserId,
  create,
  addUser,
  getUsers,
} from './organizations';
import { isEmpty } from 'lodash';
import axios from 'axios';
import { isSiretValid } from './security';
import { findById as findUserById } from './users';
import { sendMail } from '../connectors/mailer';

export const joinOrganization = async (siret, user_id) => {
  // Ensure siret is valid
  if (!isSiretValid(siret)) {
    throw new Error('invalid_siret');
  }

  const siretNoSpaces = siret.replace(/\s/g, '');
  let nom_raison_sociale = null;

  try {
    const {
      data: { etablissement },
    } = await axios({
      method: 'get',
      url: `https://entreprise.data.gouv.fr/api/sirene/v1/siret/${siretNoSpaces}`,
    });

    const siretFromSireneApi = etablissement.siret;
    nom_raison_sociale = etablissement.nom_raison_sociale;

    if (siretFromSireneApi !== siretNoSpaces) {
      throw new Error('invalid response from sirene API');
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
    !organization.authorized_email_domains.includes(emailDomain)
  ) {
    throw new Error('unable_to_auto_join_organization');
  }

  // Create organization if needed
  if (isEmpty(organization)) {
    organization = await create({
      siret: siretNoSpaces,
      authorized_email_domains: [emailDomain],
    });
  }

  // Link user to organization
  const usersInOrganizationAlready = await getUsers(organization.id);

  await addUser({ organization_id: organization.id, user_id });

  if (usersInOrganizationAlready.length > 0) {
    await sendMail({
      to: usersInOrganizationAlready.map(({ email }) => email),
      template: 'join-organization',
      params: { given_name, family_name, nom_raison_sociale },
      cc: [email, 'signup@api.gouv.fr'],
    });
  }

  return true;
};

export const getOrganizationsByUserId = findByUserId;
