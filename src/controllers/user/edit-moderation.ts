import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { NotFoundError } from "../../config/errors";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";

import { z } from "zod";
import {
  cancelModeration,
  getOrganizationFromModeration,
} from "../../managers/moderation";
import { csrfToken } from "../../middlewares/csrf-protection";
import { idSchema } from "../../services/custom-zod-schemas";

export const getEditModerationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromAuthenticatedSession(req);

    const schema = z.object({
      moderation_id: idSchema(),
    });
    let { moderation_id } = await schema.parseAsync(req.query);

    const { cached_libelle } = await getOrganizationFromModeration({
      user,
      moderation_id,
    });

    return res.render("user/edit-moderation", {
      pageTitle: "Modifier une demande de rattachement en cours",
      email: user.email,
      csrfToken: csrfToken(req),
      organization_label: cached_libelle,
      moderation_id,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(new HttpErrors.NotFound());
    }
    next(error);
  }
};

export const postCancelModerationAndRedirectControllerFactory =
  (redirectUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        moderation_id: idSchema(),
      });
      const { moderation_id } = await schema.parseAsync(req.params);
      const user = getUserFromAuthenticatedSession(req);

      await cancelModeration({ user, moderation_id });

      return res.redirect(redirectUrl);
    } catch (e) {
      if (e instanceof NotFoundError) {
        return res.redirect(redirectUrl);
      }
      next(e);
    }
  };
