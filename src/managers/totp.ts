import { generateSecret, generateUri, validateToken } from "@sunknudsen/totp";
import {
  MONCOMPTEPRO_IDENTIFIER,
  MONCOMPTEPRO_LABEL,
  SYMMETRIC_ENCRYPTION_KEY,
} from "../config/env";
import qrcode from "qrcode";
import { findById, update } from "../repositories/user";
import { isEmpty } from "lodash-es";
import { InvalidTotpTokenError, UserNotFoundError } from "../config/errors";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../services/symmetric-encryption";

export const generateAuthenticatorRegistrationOptions = async (
  email: string,
) => {
  const totpKey = generateSecret(32);

  const uri = generateUri(
    MONCOMPTEPRO_LABEL,
    email,
    totpKey,
    MONCOMPTEPRO_IDENTIFIER,
  );

  // lower case for easier usage (no caps lock required)
  // add a space every 4 char for better readability
  const humanReadableTotpKey = totpKey
    .toLowerCase()
    .replace(/.{4}(?=.)/g, "$& ");

  const qrCodeDataUrl = await new Promise((resolve, reject) => {
    qrcode.toDataURL(uri, (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });

  return { totpKey, humanReadableTotpKey, qrCodeDataUrl };
};

export const confirmAuthenticatorRegistration = async (
  user_id: number,
  temporaryTotpKey: string | undefined,
  totpToken: string,
) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  if (!temporaryTotpKey || !validateToken(temporaryTotpKey, totpToken)) {
    throw new InvalidTotpTokenError();
  }

  const encrypted_totp_key = encryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    temporaryTotpKey,
  );

  return await update(user_id, {
    encrypted_totp_key,
    totp_key_verified_at: new Date(),
  });
};

export const deleteAuthenticatorConfiguration = async (user_id: number) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return await update(user_id, {
    encrypted_totp_key: null,
    totp_key_verified_at: null,
  });
};

export const isAuthenticatorConfiguredForUser = async (user_id: number) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return !isEmpty(user.encrypted_totp_key);
};

export const isAuthenticatorTokenValid = async (
  user_id: number,
  token: string,
) => {
  const user = await findById(user_id);
  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  const decryptedTotpKey = decryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    user.encrypted_totp_key,
  );

  return validateToken(decryptedTotpKey, token);
};
