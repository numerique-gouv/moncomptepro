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
import { encryptSymmetric } from "../services/symmetric-encryption";

export const generateTotpRegistrationOptions = async (email: string) => {
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

export const confirmTotpRegistration = async (
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

export const deleteTotpConfiguration = async (user_id: number) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return await update(user_id, {
    encrypted_totp_key: null,
    totp_key_verified_at: null,
  });
};
