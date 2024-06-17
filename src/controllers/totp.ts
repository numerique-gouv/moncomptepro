import { NextFunction, Request, Response } from "express";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  authenticateWithTotp,
  confirmAuthenticatorRegistration,
  deleteAuthenticatorConfiguration,
  generateAuthenticatorRegistrationOptions,
  isAuthenticatorConfiguredForUser,
} from "../managers/totp";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { csrfToken } from "../middlewares/csrf-protection";
import { z } from "zod";
import { InvalidTotpTokenError, NotFoundError } from "../config/errors";
import { codeSchema } from "../services/custom-zod-schemas";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../managers/session/temporary-totp-key";

export const getAuthenticatorConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromAuthenticatedSession(req);

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

    const { id: user_id } = getUserFromAuthenticatedSession(req);
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

    deleteTemporaryTotpKey(req);
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

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
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await deleteAuthenticatorConfiguration(user_id);

    updateUserInAuthenticatedSession(req, updatedUser);

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};

export const postSignInWithAuthenticatorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });

    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const user = await authenticateWithTotp(user_id, totpToken);

    addAuthenticationMethodReferenceInSession(req, res, user, "totp");

    return next();
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect("/users/2fa-sign-in?notification=invalid_totp_token");
    }
    next(error);
  }
};
