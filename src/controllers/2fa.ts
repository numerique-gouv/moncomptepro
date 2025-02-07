import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { UserIsNot2faCapableError } from "../config/errors";
import { disableForce2fa, enableForce2fa } from "../managers/2fa";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import { isAuthenticatorAppConfiguredForUser } from "../managers/totp";
import { sendDisable2faMail } from "../managers/user";
import { getUserAuthenticators } from "../managers/webauthn";
import { csrfToken } from "../middlewares/csrf-protection";
import getNotificationsFromRequest from "../services/get-notifications-from-request";

export const getDoubleAuthenticationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromAuthenticatedSession(req);
    const passkeys = await getUserAuthenticators(email);

    return res.render("double-authentication", {
      pageTitle: "Double authentification",
      notifications: await getNotificationsFromRequest(req),
      email: email,
      isAuthenticatorConfigured:
        await isAuthenticatorAppConfiguredForUser(user_id),
      csrfToken: csrfToken(req),
      passkeys: passkeys,
      breadcrumbs: [
        { label: "Tableau de bord", href: "/" },
        { label: "Compte et connexion", href: "/connection-and-account" },
        { label: "Double authentification" },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getConfiguringSingleUseCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromAuthenticatedSession(req);
    return res.render("configuring-single-use-code", {
      pageTitle: "Configurer un code à usage unique",
      notifications: await getNotificationsFromRequest(req),
      email: email,
      isAuthenticatorConfigured:
        await isAuthenticatorAppConfiguredForUser(user_id),
      csrfToken: csrfToken(req),
      breadcrumbs: [
        { label: "Tableau de bord", href: "/" },
        { label: "Compte et connexion", href: "/connection-and-account" },
        { label: "Double authentification", href: "/double-authentication" },
        { label: "Code à usage unique" },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const postDisableForce2faController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await disableForce2fa(user_id);

    updateUserInAuthenticatedSession(req, updatedUser);
    await sendDisable2faMail({ user_id });

    return res.redirect(
      `/connection-and-account?notification=2fa_successfully_disabled`,
    );
  } catch (error) {
    next(error);
  }
};

export const postEnableForce2faController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await enableForce2fa(user_id);

    updateUserInAuthenticatedSession(req, updatedUser);

    return res.redirect(
      `/connection-and-account?notification=2fa_successfully_enabled`,
    );
  } catch (error) {
    if (error instanceof UserIsNot2faCapableError) {
      next(new HttpErrors.UnprocessableEntity());
    }

    next(error);
  }
};
