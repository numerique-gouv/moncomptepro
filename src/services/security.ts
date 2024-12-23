import bcrypt from "bcryptjs";
import { hasIn, isEmpty, isString } from "lodash-es";
import { HOST } from "../config/env";
import notificationMessages from "../config/notification-messages";
import type { AmrValue } from "../types/express-session";
import { owaspPasswordStrengthTest } from "./owasp-password-strength-tester";

// TODO compare to https://github.com/anandundavia/manage-users/blob/master/src/api/utils/security.js
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainPassword, 10, function (err: Error | null, hash: string) {
      if (err) {
        return reject(err);
      }

      return resolve(hash);
    });
  });
};

export const validatePassword = async (
  plainPassword: string,
  storedHash: string | null,
) => {
  if (!plainPassword || !storedHash) {
    return false;
  }

  return await bcrypt.compare(plainPassword || "", storedHash);
};

export const isPasswordSecure = (plainPassword: string, email: string) => {
  const { strong } = owaspPasswordStrengthTest(plainPassword);

  const lowerCasedBlacklistedWords = [
    email.toLowerCase(),
    "moncomptepro",
    "mon compte pro",
    "agentconnect",
    "agent connect",
    "proconnect",
    "pro connect",
  ];

  const containsBlacklistedWord = lowerCasedBlacklistedWords.some((word) =>
    plainPassword.toLowerCase().includes(word),
  );

  return !containsBlacklistedWord && strong;
};

export const isVisibleString = (input: string) => {
  const visibleCharRegex = /[^\s\p{Cf}\p{Cc}\p{Zl}\p{Zp}]/u;

  return visibleCharRegex.test(input);
};

export const getTrustedReferrerPath = (referrer: unknown): string | null => {
  if (!isString(referrer) || isEmpty(referrer)) {
    return null;
  }

  const isValidURL = URL.canParse(referrer);
  const isValidRelativeURL = URL.canParse(referrer, HOST);
  let parsedURL: URL;
  if (isValidURL) {
    parsedURL = new URL(referrer);
  } else if (isValidRelativeURL) {
    // referrer may be relative
    parsedURL = new URL(referrer, HOST);
  } else {
    return null;
  }

  const moncompteproURL = new URL(HOST);

  if (moncompteproURL.origin !== parsedURL.origin) {
    return null;
  }

  return `${parsedURL.pathname}${parsedURL.search}`;
};

export const isNotificationLabelValid = (label: unknown): label is string => {
  if (!isString(label) || isEmpty(label)) {
    return false;
  }

  return hasIn(notificationMessages, label);
};

export const addAuthenticationMethodReference = (
  amr: AmrValue[],
  newAmrValue: AmrValue,
) => {
  const newAmr = [...amr];

  if (!newAmr.includes(newAmrValue)) {
    newAmr.push(newAmrValue);
  }

  if (isTwoFactorAuthenticated(newAmr) && !newAmr.includes("mfa")) {
    newAmr.push("mfa");
  }

  return newAmr;
};

export const isTwoFactorAuthenticated = (
  authenticationMethodsReferences: Array<AmrValue>,
) => {
  const hasPwdOrEmail =
    authenticationMethodsReferences.includes("pwd") ||
    authenticationMethodsReferences.includes("email-link");
  const hasTotp = authenticationMethodsReferences.includes("totp");
  // Read more about the usage of "pop" to describe a passkey authentication:
  // https://developer.okta.com/docs/guides/configure-amr-claims-mapping/main/#supported-amr-values-by-authenticator-type
  const hasPop = authenticationMethodsReferences.includes("pop");
  // An authenticator that supports user verification is multi-factor capable.
  // See: https://www.w3.org/TR/webauthn/#sctn-authentication-factor-capability
  // More information on userVerification: https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html
  const hasUv = authenticationMethodsReferences.includes("uv");

  return (
    (hasPwdOrEmail && hasTotp) || (hasPwdOrEmail && hasPop) || (hasPop && hasUv)
  );
};

export const isOneFactorAuthenticated = (
  authenticationMethodsReferences: Array<AmrValue>,
) => {
  const hasPwd = authenticationMethodsReferences.includes("pwd");
  const hasEmail = authenticationMethodsReferences.includes("email-link");
  const hasPop = authenticationMethodsReferences.includes("pop");
  return hasPwd || hasEmail || hasPop;
};
