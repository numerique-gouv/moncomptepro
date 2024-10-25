import type { NextFunction, Request, Response } from "express";
import {
  getUserFromAuthenticatedSession,
  isPasskeyAuthenticatedSession,
} from "../../managers/session/authenticated";
import { isAuthenticatorAppConfiguredForUser } from "../../managers/totp";
import { isWebauthnConfiguredForUser } from "../../managers/webauthn";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

export const get2faSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, email } = getUserFromAuthenticatedSession(req);

    const showsTotpSection = await isAuthenticatorAppConfiguredForUser(id);

    // If a passkey has already been used for authentication in this session,
    // we cannot use another passkey, or even the same one, for a second factor.
    // To ensure proper security, we need to combine proof of possession with a different type of proof,
    // such as inherent or knowledge.
    const showsPasskeySection =
      !isPasskeyAuthenticatedSession(req) &&
      (await isWebauthnConfiguredForUser(id));

    return res.render("user/2fa-sign-in", {
      pageTitle: "Se connecter en deux étapes",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      email,
      showsTotpSection,
      showsPasskeySection,
      illustration: "illu-password.svg",
    });
  } catch (error) {
    next(error);
  }
};

export const get2faConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/2fa-configuration", {
      pageTitle: "Configurer la connexion à deux facteurs (2FA)",
      notifications: await getNotificationsFromRequest(req),
      illustration: "illu-password.svg",
    });
  } catch (error) {
    next(error);
  }
};
