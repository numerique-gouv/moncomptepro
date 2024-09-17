import * as Sentry from "@sentry/node";
import axios, { type AxiosResponse } from "axios";
import { mapValues, memoize } from "lodash-es";
import { HTTP_CLIENT_TIMEOUT } from "../config/env";
import { logger } from "../services/log";

type GithubPasskeyAuthenticatorAaguidsResponse = {
  [key: string]: {
    name: string;
    icon_dark: string;
    icon_light: string;
  };
};

const fetchPasskeyAuthenticatorAaguids = async () => {
  try {
    const { data }: AxiosResponse<GithubPasskeyAuthenticatorAaguidsResponse> =
      await axios({
        method: "get",
        url: "https://raw.githubusercontent.com/passkeydeveloper/passkey-authenticator-aaguids/main/combined_aaguid.json",
        headers: {
          accept: "application/json",
        },
        timeout: HTTP_CLIENT_TIMEOUT,
      });

    return mapValues(data, ({ name }) => name);
  } catch (error) {
    logger.error(error);

    throw new Error("Error from github call");
  }
};

const memoizedFetchPasskeyAuthenticatorAaguids = memoize(
  fetchPasskeyAuthenticatorAaguids,
);

export const getAuthenticatorFriendlyName = async (
  aaguids: string,
): Promise<string | null> => {
  let passkeyAuthenticatorAaguids: { [p: string]: string };
  try {
    passkeyAuthenticatorAaguids =
      await memoizedFetchPasskeyAuthenticatorAaguids();
  } catch (err) {
    // fail silently
    Sentry.captureException(err);
    return null;
  }

  const authenticatorFriendlyName: string | undefined =
    passkeyAuthenticatorAaguids[aaguids];

  return authenticatorFriendlyName ?? null;
};
