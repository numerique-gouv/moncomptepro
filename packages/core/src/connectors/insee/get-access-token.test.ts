//

import axios, { type AxiosResponse } from "axios";

//

type GetInseeAccessTokenCradle = {
  fetch: typeof globalThis.fetch;
  username: string;
  password: string;
  timeout: number;
};

type GetTokenReponse = {
  access_token: string;
  scope: "am_application_scope default";
  token_type: "Bearer";
  expires_in: number;
};

//

type Credentials = {
  username: string;
  password: string;
  timeout: number;
};

function createInseeTokenRequest(credentials: Credentials) {
  const { username, password, timeout } = credentials;

  return {
    url: "https://api.insee.fr/token",
    body: "grant_type=client_credentials",
    config: {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username, password },
      timeout,
    },
  };
}

export function GetInseeAccessToken(cradle: GetInseeAccessTokenCradle) {
  const { username, password, timeout } = cradle;
  return async function getInseeAccessToken() {
    const {
      data: { access_token },
    }: AxiosResponse<GetTokenReponse> = await axios.post(
      "https://api.insee.fr/token",
      "grant_type=client_credentials",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username,
          password,
        },
        timeout,
      },
    );

    return access_token;
  };
}
