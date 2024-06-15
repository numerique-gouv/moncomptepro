import { NextFunction, Request, Response } from "express";
import {
  getUserFromAuthenticatedSession,
  isPasskeyAuthenticatedSession,
} from "../../managers/session";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { csrfToken } from "../../middlewares/csrf-protection";

export const get2faSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);

    return res.render("user/2fa-sign-in", {
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
