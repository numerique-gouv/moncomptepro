import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { InvalidTotpTokenError, NotFoundError } from "../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../managers/session/temporary-totp-key";
import {
  authenticateWithAuthenticatorApp,
  confirmAuthenticatorAppRegistration,
  deleteAuthenticatorAppConfiguration,
  generateAuthenticatorAppRegistrationOptions,
  isAuthenticatorAppConfiguredForUser,
} from "../managers/totp";
import {
  sendAddFreeTOTPEmail,
  sendChangeAppliTotpEmail,
  sendDeleteFreeTOTPApplicationEmail,
} from "../managers/user";
import { csrfToken } from "../middlewares/csrf-protection";
import { codeSchema } from "../services/custom-zod-schemas";
import getNotificationsFromRequest from "../services/get-notifications-from-request";

export const getAuthenticatorAppConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromAuthenticatedSession(req);

    const existingTemporaryTotpKey = getTemporaryTotpKey(req);

    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateAuthenticatorAppRegistrationOptions(
        email,
        existingTemporaryTotpKey,
      );

    setTemporaryTotpKey(req, totpKey);

    return res.render("authenticator-app-configuration", {
      pageTitle: "Configuration TOTP",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      isAuthenticatorAlreadyConfigured:
        await isAuthenticatorAppConfiguredForUser(user_id),
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const postAuthenticatorAppConfigurationController = async (
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
      await isAuthenticatorAppConfiguredForUser(user_id);
    const temporaryTotpKey = getTemporaryTotpKey(req);

    if (!temporaryTotpKey) {
      throw new NotFoundError();
    }

    const updatedUser = await confirmAuthenticatorAppRegistration(
      user_id,
      temporaryTotpKey,
      totpToken,
    );

    deleteTemporaryTotpKey(req);
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

    if (!isAuthenticatorAlreadyConfigured) {
      sendAddFreeTOTPEmail({ user_id });
    } else {
      sendChangeAppliTotpEmail({ user_id });
    }
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
        "/authenticator-app-configuration?notification=invalid_totp_token",
      );
    }

    next(error);
  }
};

export const postDeleteAuthenticatorAppConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await deleteAuthenticatorAppConfiguration(user_id);

    updateUserInAuthenticatedSession(req, updatedUser);

    sendDeleteFreeTOTPApplicationEmail({ user_id });

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};

export const postSignInWithAuthenticatorAppController = async (
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

    const user = await authenticateWithAuthenticatorApp(user_id, totpToken);

    addAuthenticationMethodReferenceInSession(req, res, user, "totp");

    return next();
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect("/users/2fa-sign-in?notification=invalid_totp_token");
    }
    next(error);
  }
};
