//

import { getOrganizationInfoFactory } from "@gouvfr-lasuite/proconnect.identite/organization";
import {
  findBySirenFactory,
  findBySiretFactory,
} from "@gouvfr-lasuite/proconnect.insee/entreprises";
import { getInseeAccessTokenFactory } from "@gouvfr-lasuite/proconnect.insee/token";
import {
  HTTP_CLIENT_TIMEOUT,
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
} from "../config/env";

//

export const getAccessToken = getInseeAccessTokenFactory(
  {
    consumerKey: INSEE_CONSUMER_KEY,
    consumerSecret: INSEE_CONSUMER_SECRET,
  },
  {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
);

export const findBySiret = findBySiretFactory({
  getAccessToken,
  config: {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
});

export const findBySiren = findBySirenFactory({
  getAccessToken,
  config: {
    timeout: HTTP_CLIENT_TIMEOUT,
  },
});

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren,
  findBySiret,
});
