import axios, { AxiosError, AxiosResponse } from 'axios';
import { isEmailValid } from '../services/security';
import {
  ApiAnnuaireInvalidEmailError,
  ApiAnnuaireNotFoundError,
  ApiAnnuaireTimeoutError,
  ApiAnnuaireTooManyResultsError,
} from '../errors';
import { isEmpty } from 'lodash';
import {
  DO_NOT_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from '../env';

// more info at https://plateforme.adresse.data.gouv.fr/api-annuaire/v3/definitions.yaml
// the API used is more up to date than the official one: https://etablissements-publics.api.gouv.fr/v3/definitions.yaml
type ApiAnnuaireReponse = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      // ex: "4b3bd44a-f249-4a3c-8c54-b3479c3a2f92"
      id: string;
      // ex: "74056"
      codeInsee: string;
      // ex: "mairie
      pivotLocal: string;
      // ex: "Mairie - Chamonix-Mont-Blanc"
      nom: string;
      adresses: {
        type: 'Adresse';
        // ex: ["38 place de l'Église"]
        lignes: string[];
        // ex: '74402'
        codePostal: string;
        // ex: 'Chamonix Cedex'
        commune: string;
      }[];
      // ex: 'sg@chamonix.fr'
      email: string;
      // ex: '04 50 53 11 13'
      telephone: string;
      // ex: 'http://www.chamonix-mont-blanc.fr'
      url: string;
      zonage: {
        // ex: ['74056 Chamonix-Mont-Blanc']
        communes: string[];
      };
    };
  }[];
};

export const getContactEmail = async (
  codeOfficielGeographique: string | null
): Promise<string> => {
  if (isEmpty(codeOfficielGeographique)) {
    throw new ApiAnnuaireNotFoundError();
  }

  let features: ApiAnnuaireReponse['features'] = [];
  try {
    const { data }: AxiosResponse<ApiAnnuaireReponse> = await axios({
      method: 'get',
      url: `https://plateforme.adresse.data.gouv.fr/api-annuaire/v3/communes/${codeOfficielGeographique}/mairie`,
      headers: {
        accept: 'application/json',
      },
      timeout: HTTP_CLIENT_TIMEOUT,
    });

    features = data.features;
  } catch (e) {
    if (e instanceof AxiosError && e.code === 'ECONNABORTED') {
      throw new ApiAnnuaireTimeoutError();
    }

    throw e;
  }

  if (features.length === 0) {
    throw new ApiAnnuaireNotFoundError();
  }

  if (features.length > 1) {
    throw new ApiAnnuaireTooManyResultsError();
  }

  const [
    {
      properties: { email },
    },
  ] = features;

  if (!isEmailValid(email)) {
    throw new ApiAnnuaireInvalidEmailError();
  }

  if (DO_NOT_USE_ANNUAIRE_EMAILS) {
    console.log(`A test email was used instead of ${email}.`);
    return TEST_CONTACT_EMAIL;
  }

  return email;
};
