//

import { getOrganizationInfoFactory } from "@gouvfr-lasuite/proconnect.identite/organization";
import {
  findBySirenFactory,
  findBySiretFactory,
  getInseeAccessTokenFactory,
} from "@gouvfr-lasuite/proconnect.insee/api";
import {
  HTTP_CLIENT_TIMEOUT,
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
} from "../config/env";

//

export const getInseeAccessToken = getInseeAccessTokenFactory(
  {
    consumerKey: INSEE_CONSUMER_KEY,
    consumerSecret: INSEE_CONSUMER_SECRET,
  },
  {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
);

export const findBySiret = findBySiretFactory({
  getInseeAccessToken,
  config: {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
});

export const findBySiren = findBySirenFactory({
  getInseeAccessToken,
  config: {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
});

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren,
  findBySiret,
});
