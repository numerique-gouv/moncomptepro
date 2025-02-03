//

import {
  getFranceConnectConfigurationFactory,
  getFranceConnectRedirectUrlFactory,
  getFranceConnectUserFactory,
} from "@gouvfr-lasuite/proconnect.identite/certification/executive";
import {
  FRANCECONNECT_CALLBACK_URL,
  FRANCECONNECT_CLIENT_ID,
  FRANCECONNECT_CLIENT_SECRET,
  FRANCECONNECT_ISSUER,
  FRANCECONNECT_SCOPES,
  HOST,
} from "../config/env";

//

export const getFranceConnectConfiguration =
  getFranceConnectConfigurationFactory(
    new URL(FRANCECONNECT_ISSUER),
    FRANCECONNECT_CLIENT_ID,
    FRANCECONNECT_CLIENT_SECRET,
  );

export const getFranceConnectRedirectUrl = getFranceConnectRedirectUrlFactory(
  getFranceConnectConfiguration,
  {
    callbackUrl: `${HOST}${FRANCECONNECT_CALLBACK_URL}`,
    scope: FRANCECONNECT_SCOPES.join(" "),
  },
);

export const getFranceConnectUser = getFranceConnectUserFactory(
  getFranceConnectConfiguration,
);
