import { NextFunction, Request, Response } from "express";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  getUserFromLoggedInSession,
  markAsTwoFactorVerifiedInSession,
  setTemporaryTotpKey,
  updateUserInLoggedInSession,
} from "../managers/session";
import {
  confirmAuthenticatorRegistration,
  deleteAuthenticatorConfiguration,
  generateAuthenticatorRegistrationOptions,
  isAuthenticatorConfiguredForUser,
  isAuthenticatorTokenValid,
} from "../managers/totp";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { csrfToken } from "../middlewares/csrf-protection";
import { z } from "zod";
import { InvalidTotpTokenError, NotFoundError } from "../config/errors";
import { codeSchema } from "../services/custom-zod-schemas";

export const getAuthenticatorConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromLoggedInSession(req);

    const existingTemporaryTotpKey = getTemporaryTotpKey(req);

    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateAuthenticatorRegistrationOptions(
        email,
        existingTemporaryTotpKey,
      );

    setTemporaryTotpKey(req, totpKey);

    return res.render("authenticator-configuration", {
      pageTitle: "Configuration TOTP",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      isAuthenticatorAlreadyConfigured:
        await isAuthenticatorConfiguredForUser(user_id),
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const postAuthenticatorConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });
    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromLoggedInSession(req);
    const isAuthenticatorAlreadyConfigured =
      await isAuthenticatorConfiguredForUser(user_id);
    const temporaryTotpKey = getTemporaryTotpKey(req);

    if (!temporaryTotpKey) {
      throw new NotFoundError();
    }

    const updatedUser = await confirmAuthenticatorRegistration(
      user_id,
      temporaryTotpKey,
      totpToken,
    );

    updateUserInLoggedInSession(req, updatedUser);
    deleteTemporaryTotpKey(req);
    markAsTwoFactorVerifiedInSession(req, res);

    return res.redirect(
      `/connection-and-account?notification=${
        isAuthenticatorAlreadyConfigured
          ? "authenticator_updated"
          : "authenticator_added"
      }`,
    );
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect(
        "/authenticator-configuration?notification=invalid_totp_token",
      );
    }

    next(error);
  }
};

export const postDeleteAuthenticatorConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromLoggedInSession(req);

    const updatedUser = await deleteAuthenticatorConfiguration(user_id);

    updateUserInLoggedInSession(req, updatedUser);

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatorSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/sign-in-with-authenticator", {
      pageTitle: "Se connecter avec application d’authentification",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postAuthenticatorSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });

    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromLoggedInSession(req);

    if (!(await isAuthenticatorTokenValid(user_id, totpToken))) {
      return res.redirect(
        "/sign-in-with-authenticator?notification=invalid_totp_token",
      );
    }

    markAsTwoFactorVerifiedInSession(req, res);

    return next();
  } catch (error) {
    next(error);
  }
};
