import { NextFunction, Request, Response } from "express";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { ZodError } from "zod";
import { updatePersonalInformations } from "../managers/user";
import notificationMessages from "../config/notification-messages";
import { getClientsOrderedByConnectionCount } from "../managers/oidc-client";
import { getParamsForPostPersonalInformationsController } from "./user/update-personal-informations";
import { getUserOrganizations } from "../managers/organization/main";
import {
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
  updateUserInLoggedInSession,
} from "../managers/session";
import { csrfToken } from "../middlewares/csrf-protection";

export const getHomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const oidc_clients = await getClientsOrderedByConnectionCount(
    getUserFromLoggedInSession(req).id,
  );

  return res.render("home", {
    pageTitle: "Accueil",
    notifications: await getNotificationsFromRequest(req),
    oidc_clients,
  });
};

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);
    return res.render("personal-information", {
      pageTitle: "Vos informations personnelles",
      email: user.email,
      given_name: user.given_name,
      family_name: user.family_name,
      phone_number: user.phone_number,
      job: user.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
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
      getUserFromLoggedInSession(req).id,
      {
        given_name,
        family_name,
        phone_number,
        job,
      },
    );

    updateUserInLoggedInSession(req, updatedUser);

    return res.render("personal-information", {
      pageTitle: "Vos informations personnelles",
      email: updatedUser.email,
      given_name: updatedUser.given_name,
      family_name: updatedUser.family_name,
      phone_number: updatedUser.phone_number,
      job: updatedUser.job,
      notifications: [
        notificationMessages["personal_information_update_success"],
      ],
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/personal-information?notification=invalid_personal_informations`,
      );
    }

    next(error);
  }
};

export const getManageOrganizationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userOrganizations, pendingUserOrganizations } =
      await getUserOrganizations({
        user_id: getUserFromLoggedInSession(req).id,
      });

    return res.render("manage-organizations", {
      pageTitle: "Vos organisations",
      notifications: await getNotificationsFromRequest(req),
      userOrganizations,
      pendingUserOrganizations,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("reset-password", {
      pageTitle: "Votre mot de passe",
      notifications: await getNotificationsFromRequest(req),
      loginHint: getUserFromLoggedInSession(req).email,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getHelpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = isWithinLoggedInSession(req)
    ? getUserFromLoggedInSession(req).email
    : null;
  return res.render("help", {
    pageTitle: "Aide",
    email,
    csrfToken: email && csrfToken(req),
  });
};
