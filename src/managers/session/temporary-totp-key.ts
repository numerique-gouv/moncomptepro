import { Request } from "express";
import { UserNotLoggedInError } from "../../config/errors";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../../services/symmetric-encryption";
import { SYMMETRIC_ENCRYPTION_KEY } from "../../config/env";
import { isWithinAuthenticatedSession } from "./authenticated";

export const setTemporaryTotpKey = (req: Request, totpKey: string) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.temporaryEncryptedTotpKey = encryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    totpKey,
  );
};
export const getTemporaryTotpKey = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  if (!req.session.temporaryEncryptedTotpKey) {
    return null;
  }

  return decryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    req.session.temporaryEncryptedTotpKey,
  );
};
export const deleteTemporaryTotpKey = (req: Request) => {
  delete req.session.temporaryEncryptedTotpKey;
};
