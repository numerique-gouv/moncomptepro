import { findBySiret, findByUserId, insert } from './organizations';
import { isEmpty } from 'lodash';
import axios from 'axios';
import { isSiretValid } from './security';

export const createOrganization = async (siret, user_id) => {
  if (!isSiretValid(siret)) {
    throw new Error('invalid_siret');
  }

  const siretNoSpaces = siret.replace(/\s/g, '');

  try {
    const {
      data: {
        etablissement: { siret: siretFromSireneApi },
      },
    } = await axios({
      method: 'get',
      url: `https://entreprise.data.gouv.fr/api/sirene/v1/siret/${siretNoSpaces}`,
    });

    if (siretFromSireneApi !== siretNoSpaces) {
      throw new Error('invalid response from sirene API');
    }
  } catch (error) {
    console.error(error);

    throw new Error('invalid_siret');
  }

  const organization = await findBySiret(siretNoSpaces);

  if (!isEmpty(organization)) {
    throw new Error('organization_unavailable');
  }

  return await insert({ siret: siretNoSpaces, user_id });
};

export const getOrganizationsByUserId = findByUserId;
