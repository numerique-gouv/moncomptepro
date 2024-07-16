import axios, { AxiosError, AxiosResponse } from "axios";
import { isEmpty, isString } from "lodash-es";
import {
  DO_NOT_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from "../config/env";
import {
  ApiAnnuaireConnectionError,
  ApiAnnuaireInvalidEmailError,
  ApiAnnuaireNotFoundError,
  ApiAnnuaireTooManyResultsError,
} from "../config/errors";
import { logger } from "../services/log";
import { isEmailValid } from "../services/security";

// more info at https://etablissements-publics.api.gouv.fr/v3/definitions.yaml
// the API used is more up to date than the official one: https://etablissements-publics.api.gouv.fr/v3/definitions.yaml
type ApiAnnuaireServicePublicReponse = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: {
      type: "Point";
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
        type: "Adresse";
        // ex: ["38 place de l'Église"]
        lignes: string[];
        // ex: '74402'
        codePostal: string;
        // ex: 'Chamonix Cedex'
        commune: string;
      }[];
      // ex: 'sg@chamonix.fr'
      email?: string;
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

type TestApiAnnuaireServicePublicReponse = {
  total_count: number;
  results: {
    site_internet: {
      valeur: string;
    }[];
    nom: string;
    adresse_courriel?: string;
    pivot: {
      type_service_local: string;
    }[];
    id: string;
    telephone: {
      valeur: string;
    }[];
    code_insee_commune: string;
    adresse: {
      type_adresse: "Adresse";
      numero_voie: string;
      code_postal: string;
      nom_commune: string;
      longitude: string;
      latitude: string;
    }[];
  }[];
};

export const getAnnuaireServicePublicContactEmail = async (
  codeOfficielGeographique: string | null,
  codePostal: string | null,
): Promise<string> => {
  if (isEmpty(codeOfficielGeographique)) {
    throw new ApiAnnuaireNotFoundError();
  }

  let features: TestApiAnnuaireServicePublicReponse["results"] = [];
  try {
    const { data }: AxiosResponse<TestApiAnnuaireServicePublicReponse> =
      await axios({
        method: "get",
        // url: `https://etablissements-publics.api.gouv.fr/v3/communes/${codeOfficielGeographique}/mairie`,
        url: `https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE ${codeOfficielGeographique} and pivot LIKE "mairie"`,
        headers: {
          accept: "application/json",
        },
        timeout: HTTP_CLIENT_TIMEOUT,
      });
    console.log(data, "🔥🔥🔥🔥");

    features = data.results;
  } catch (e) {
    if (
      e instanceof AxiosError &&
      (e.code === "ECONNABORTED" ||
        e.code === "ERR_BAD_RESPONSE" ||
        e.code === "EAI_AGAIN")
    ) {
      throw new ApiAnnuaireConnectionError();
    }

    throw e;
  }

  let feature: TestApiAnnuaireServicePublicReponse["results"][0] | undefined;

  if (features.length === 1) {
    feature = features[0];
  }

  if (features.length > 1) {
    if (isEmpty(codePostal)) {
      // without postal code we cannot choose a mairie
      throw new ApiAnnuaireTooManyResultsError();
    }

    // Take the first match
    feature = features.find(
      ({ adresse: [{ code_postal: codePostalMairie }] }) =>
        codePostalMairie === codePostal,
    );
  }

  if (isEmpty(feature)) {
    throw new ApiAnnuaireNotFoundError();
  }

  const { adresse_courriel } = feature;

  if (!isString(adresse_courriel)) {
    throw new ApiAnnuaireInvalidEmailError();
  }

  const formattedEmail = adresse_courriel.toLowerCase().trim();

  if (!isEmailValid(formattedEmail)) {
    throw new ApiAnnuaireInvalidEmailError();
  }

  if (DO_NOT_USE_ANNUAIRE_EMAILS) {
    logger.info(
      `Test email address ${TEST_CONTACT_EMAIL} was used instead of the real one ${formattedEmail}.`,
    );
    return TEST_CONTACT_EMAIL;
  }

  return formattedEmail;
};
