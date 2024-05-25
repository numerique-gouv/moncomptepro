import { NextFunction, Request, Response } from "express";
import {
  getTemporaryTotpKey,
  getUserFromLoggedInSession,
  setTemporaryTotpKey,
  updateUserInLoggedInSession,
} from "../managers/session";
import {
  confirmTotpRegistration,
  deleteTotpConfiguration,
  generateTotpRegistrationOptions,
} from "../managers/totp";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { csrfToken } from "../middlewares/csrf-protection";
import { z } from "zod";
import { InvalidTotpTokenError } from "../config/errors";

export const getTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateTotpRegistrationOptions(user.email);

    setTemporaryTotpKey(req, totpKey);

    return res.render("totp-configuration", {
      pageTitle: "Configuration TOTP",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      alreadyHasATotpKey: !!user.totp_key_verified_at,
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const postTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: z
        .string()
        .trim()
        .min(1)
        .transform((val) => val.replace(/\s+/g, "")),
    });

    const { totpToken } = await schema.parseAsync(req.body);

    const user = getUserFromLoggedInSession(req);
    const alreadyHasATotpKey = !!user.totp_key_verified_at;
    const temporaryTotpSecret = getTemporaryTotpKey(req);

    const updatedUser = await confirmTotpRegistration(
      user.id,
      temporaryTotpSecret,
      totpToken,
    );

    updateUserInLoggedInSession(req, updatedUser);

    return res.redirect(
      `/connection-and-account?notification=${
        alreadyHasATotpKey ? "authenticator_updated" : "authenticator_added"
      }`,
    );
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect(
        "/totp-configuration?notification=invalid_totp_token",
      );
    }

    next(error);
  }
};

export const postDeleteTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const updatedUser = await deleteTotpConfiguration(user.id);

    updateUserInLoggedInSession(req, updatedUser);

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};
