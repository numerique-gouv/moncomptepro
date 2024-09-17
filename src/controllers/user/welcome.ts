import type { NextFunction, Request, Response } from "express";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import { update } from "../../repositories/user";

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user = getUserFromAuthenticatedSession(req);
    const showInclusionConnectOnboardingHelp =
      user.needs_inclusionconnect_onboarding_help;
    user = await update(user.id, {
      needs_inclusionconnect_onboarding_help: false,
    });
    updateUserInAuthenticatedSession(req, user);

    return res.render("user/welcome", {
      pageTitle: "Compte créé",
      csrfToken: csrfToken(req),
      illustration: "welcome.svg",
      showInclusionConnectOnboardingHelp,
    });
  } catch (error) {
    next(error);
  }
};
