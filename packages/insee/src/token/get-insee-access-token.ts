//

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

//

export type InseeCredentials = {
  consumerKey: string;
  consumerSecret: string;
};
export type GetTokenReponse = {
  access_token: string;
  scope: "am_application_scope default";
  token_type: "Bearer";
  expires_in: number;
};

//

export function getInseeAccessTokenFactory(
  credentials: InseeCredentials,
  config?: AxiosRequestConfig,
) {
  return async function getInseeAccessToken() {
    const {
      data: { access_token },
    }: AxiosResponse<GetTokenReponse> = await axios.post(
      "https://api.insee.fr/token",
      "grant_type=client_credentials",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: credentials.consumerKey,
          password: credentials.consumerSecret,
        },
        ...config,
      },
    );

    return access_token;
  };
}
