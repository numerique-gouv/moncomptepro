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

// more info at https://api-lannuaire.service-public.fr/api/explore/v2.1/console

type ApiAnnuaireServicePublicReponse = {
  type: "FeatureCollection";
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

  let features: ApiAnnuaireServicePublicReponse["results"] = [];
  try {
    const { data }: AxiosResponse<ApiAnnuaireServicePublicReponse> =
      await axios({
        method: "get",
        url: `https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE "${codeOfficielGeographique}" and pivot LIKE "mairie"`,
        headers: {
          accept: "application/json",
        },
        timeout: HTTP_CLIENT_TIMEOUT,
      });

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

  let feature: ApiAnnuaireServicePublicReponse["results"][0] | undefined;

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
