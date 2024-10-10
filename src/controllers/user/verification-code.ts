import type { NextFunction, Request, Response } from "express";
import {
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
} from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";

export const getVerificationCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let email: string | undefined;
    let user: User | undefined;

    if (isWithinAuthenticatedSession(req.session)) {
      user = getUserFromAuthenticatedSession(req);
      email = user.email;
    }

    return res.render("verification-code", {
      pageTitle: "Renvoyer un code",
      email,
      csrfToken: email && csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};
