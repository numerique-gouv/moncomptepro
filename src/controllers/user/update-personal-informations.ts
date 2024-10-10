import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod";
import { NotFoundError } from "../../config/errors";
import { getOrganizationFromModeration } from "../../managers/moderation";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { updatePersonalInformations } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  idSchema,
  jobSchema,
  nameSchema,
  phoneNumberSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      given_name,
      family_name,
      phone_number,
      job,
      needs_inclusionconnect_onboarding_help,
    } = getUserFromAuthenticatedSession(req);
    return res.render("user/personal-information", {
      pageTitle: "Renseigner votre identité",
      given_name,
      family_name,
      phone_number,
      job,
      needs_inclusionconnect_onboarding_help,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};
export const getParamsForPostPersonalInformationsController = async (
  req: Request,
) => {
  const schema = z.object({
    given_name: nameSchema(),
    family_name: nameSchema(),
    phone_number: phoneNumberSchema(),
    job: jobSchema(),
  });

  return await schema.parseAsync(req.body);
};
export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { given_name, family_name, phone_number, job } =
      await getParamsForPostPersonalInformationsController(req);

    const updatedUser = await updatePersonalInformations(
      getUserFromAuthenticatedSession(req).id,
      {
        given_name,
        family_name,
        phone_number,
        job,
      },
    );

    updateUserInAuthenticatedSession(req, updatedUser);

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/users/personal-information?notification=invalid_personal_informations`,
      );
    }

    next(error);
  }
};
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

    return res.render("edit-moderation", {
      pageTitle: "Modifier une demande de rattachement en cours",
      email: user.email,
      csrfToken: user.email && csrfToken(req),
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
