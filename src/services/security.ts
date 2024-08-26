import bcrypt from "bcryptjs";
import { hasIn, isEmpty, isString } from "lodash-es";
import { customAlphabet, nanoid } from "nanoid/async";
import { parse_host } from "tld-extract";
import { MONCOMPTEPRO_HOST } from "../config/env";
import notificationMessages from "../config/notification-messages";
import { AmrValue } from "../types/express-session";
import { owaspPasswordStrengthTest } from "./owasp-password-strength-tester";
import dicewareWordlistFrAlt from "./security/diceware-wordlist-fr-alt";

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
    "cheval exact agrafe pile",
  ];

  const containsBlacklistedWord = lowerCasedBlacklistedWords.some((word) =>
    plainPassword.toLowerCase().includes(word),
  );

  return !containsBlacklistedWord && strong;
};

/*
 * specifications of these functions can be found at
 * https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation
 */
export const isDomainValid = (domain: unknown): domain is string => {
  if (!isString(domain) || isEmpty(domain)) {
    return false;
  }

  if (domain.match(/^[a-zA-Z0-9.-]*$/) === null) {
    return false;
  }

  try {
    parse_host(domain, { allowDotlessTLD: true });
  } catch (error) {
    return false;
  }

  return true;
};
export const isEmailValid = (email: unknown): email is string => {
  if (!isString(email) || isEmpty(email)) {
    return false;
  }

  const parts = email.split("@").filter((part) => part);

  // The email address contains two parts, separated with an @ symbol.
  // => these parts are non-empty strings
  // => there are two and only two parts
  if (parts.length !== 2) {
    return false;
  }

  // The email address does not contain dangerous characters
  // => the postgres connector is taking care of this

  // The domain part contains only letters, numbers, hyphens (-) and periods (.)
  const domain = parts[1];
  if (!isDomainValid(domain)) {
    return false;
  }

  // The local part (before the @) should be no more than 63 characters.
  const localPart = parts[0];
  if (Buffer.from(localPart).length > 63) {
    return false;
  }

  // The total length should be no more than 254 characters.
  if (Buffer.from(email).length > 254) {
    return false;
  }

  return true;
};

export const isPhoneNumberValid = (
  phoneNumber: unknown,
): phoneNumber is string => {
  if (!isString(phoneNumber) || isEmpty(phoneNumber)) {
    return false;
  }

  if (!phoneNumber.match(/^\+?(?:[0-9][ -]?){6,14}[0-9]$/)) {
    return false;
  }

  return true;
};

export const isVisibleString = (input: string) => {
  const visibleCharRegex = /[^\s\p{Cf}\p{Cc}\p{Zl}\p{Zp}]/u;

  return visibleCharRegex.test(input);
};

export const isNameValid = (name: string) => {
  return !!name.match(/^[^$&+:;=?@#|<>.^*()%!\d_\[\]{}\\\/"`~]*$/);
};

const nanoidPin = customAlphabet("0123456789", 10);

export const generatePinToken = async () => {
  return await nanoidPin();
};

export const generateToken = async () => {
  return await nanoid(64);
};

type dice = "1" | "2" | "3" | "4" | "5" | "6";
type fiveDices = `${dice}${dice}${dice}${dice}${dice}`;
const nanoidFiveDices = customAlphabet("123456", 5);

export const generateDicewarePassword = async () => {
  const firstFiveDices = (await nanoidFiveDices()) as fiveDices;
  const secondFiveDices = (await nanoidFiveDices()) as fiveDices;

  return `${dicewareWordlistFrAlt[firstFiveDices]}-${dicewareWordlistFrAlt[secondFiveDices]}`;
};

export const isSiretValid = (siret: unknown): siret is string => {
  if (!isString(siret) || isEmpty(siret)) {
    return false;
  }

  const siretNoSpaces = siret.replace(/\s/g, "");

  return /^\d{14}$/.test(siretNoSpaces);
};

export const getTrustedReferrerPath = (referrer: unknown): string | null => {
  if (!isString(referrer) || isEmpty(referrer)) {
    return null;
  }

  const isValidURL = URL.canParse(referrer);
  const isValidRelativeURL = URL.canParse(referrer, MONCOMPTEPRO_HOST);
  let parsedURL: URL;
  if (isValidURL) {
    parsedURL = new URL(referrer);
  } else if (isValidRelativeURL) {
    // referrer may be relative
    parsedURL = new URL(referrer, MONCOMPTEPRO_HOST);
  } else {
    return null;
  }

  const moncompteproURL = new URL(MONCOMPTEPRO_HOST);

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
