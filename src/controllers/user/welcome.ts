import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { idSchema } from "../../services/custom-zod-schemas";

import { getSponsorLabel } from "../../managers/organization/authentication-by-peers";
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
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.params);

    const sponsor_label = await getSponsorLabel({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
    });

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
      sponsor_label,
      illustration: "welcome.svg",
      showInclusionConnectOnboardingHelp,
    });
  } catch (error) {
    next(error);
  }
};
