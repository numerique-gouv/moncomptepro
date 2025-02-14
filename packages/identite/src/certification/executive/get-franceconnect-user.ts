//

import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  ClientSecretPost,
  Configuration,
  fetchUserInfo,
  randomNonce,
  randomState,
} from "openid-client";
import { z } from "zod";
import {
  FranceConnectUserInfoSchema,
  type FranceConnectUserInfo,
} from "../../types/franceconnect.schema.js";

//

export function getFranceConnectConfigurationFactory(
  server: URL,
  clientId: string,
  clientSecret: string,
) {
  return function getFranceConnectConfiguration() {
    const serverUri = server.toString();
    return new Configuration(
      {
        authorization_endpoint: `${serverUri}/authorize`,
        issuer: server.origin,
        jwks_uri: `${serverUri}/jwks`,
        token_endpoint: `${serverUri}/token`,
        userinfo_endpoint: `${serverUri}/userinfo`,
        token_endpoint_auth_method: "client_secret_basic",
      },
      clientId,
      {
        id_token_signed_response_alg: "HS256",
      },
      ClientSecretPost(clientSecret),
    );
  };
}
export type GetFranceConnectConfigurationHandler = ReturnType<
  typeof getFranceConnectConfigurationFactory
>;

export function createChecks() {
  return {
    state: randomState(),
    nonce: randomNonce(),
  };
}

export function getFranceConnectRedirectUrlFactory(
  getConfiguration: GetFranceConnectConfigurationHandler,
  parameters: {
    callbackUrl: string;
    scope: string;
  },
) {
  const { callbackUrl, scope } = parameters;
  return async function getFranceConnectUser(nonce: string, state: string) {
    const config = getConfiguration();
    return buildAuthorizationUrl(
      config,
      new URLSearchParams({
        nonce,
        redirect_uri: callbackUrl,
        scope,
        state,
      }),
    );
  };
}

export function getFranceConnectUserFactory(
  getConfiguration: GetFranceConnectConfigurationHandler,
) {
  return async function getFranceConnectUser(parameters: {
    code: string;
    currentUrl: string;
    expectedNonce: string;
    expectedState: string;
  }) {
    const { code, currentUrl, expectedNonce, expectedState } = parameters;
    const config = getConfiguration();
    const tokens = await authorizationCodeGrant(
      config,
      new URL(currentUrl),
      {
        expectedNonce,
        expectedState,
      },
      { code },
    );
    const claims = tokens.claims();

    const { sub } = await z
      .object({
        sub: z.string(),
      })
      .parseAsync(claims);
    const userInfo = await fetchUserInfo(config, tokens.access_token, sub);
    return FranceConnectUserInfoSchema.passthrough().parseAsync(
      userInfo,
    ) as Promise<FranceConnectUserInfo>;
  };
}
