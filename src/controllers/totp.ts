import { NextFunction, Request, Response } from "express";
import {
  addAuthenticationMethodReferenceInSession,
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  getUserFromAuthenticatedSession,
  isPasskeyAuthenticatedSession,
  setTemporaryTotpKey,
  updateUserInAuthenticatedSession,
} from "../managers/session";
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

export const getMfaSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);

    return res.render("user/mfa-sign-in", {
      pageTitle: "Se connecter en deux étapes",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      email,
      // If a passkey has already been used for authentication in this session,
      // we cannot use another passkey, or even the same one, for a second factor.
      // To ensure proper security, we need to combine proof of possession with a different type of proof,
      // such as inherent or knowledge.
      showPasskeySection: !isPasskeyAuthenticatedSession(req),
    });
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
      return res.redirect("/users/mfa-sign-in?notification=invalid_totp_token");
    }
    next(error);
  }
};
