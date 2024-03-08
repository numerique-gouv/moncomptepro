import { NextFunction, Request, Response } from "express";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { z, ZodError } from "zod";
import { updatePersonalInformations } from "../managers/user";
import { AUTOUPDATE_EXTERNAL_CONTENT } from "../config/env";
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
import { idSchema } from "../services/custom-zod-schemas";
import { getOrganizationFromModeration } from "../managers/moderation";
import { isEmpty } from "lodash";
import { ForbiddenError, NotFoundError } from "../config/errors";
import {
  findBySlug as findPageBySlug,
  createPage,
  updatePage,
} from "../repositories/external-pages";
import { getExternalContent } from "../services/fetch-external-content";

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
  try {
    let email: string | undefined;
    let user: User | undefined;
    let cached_libelle: string | null | undefined;

    if (isWithinLoggedInSession(req)) {
      user = getUserFromLoggedInSession(req);
      email = user.email;
    }

    const schema = z.object({
      moderation_id: z.union([idSchema(), z.undefined()]),
    });
    let { moderation_id } = await schema.parseAsync(req.query);

    if (!isEmpty(user) && moderation_id) {
      try {
        const organization = await getOrganizationFromModeration({
          user,
          moderation_id,
        });
        cached_libelle = organization.cached_libelle;
      } catch (e) {
        if (!(e instanceof NotFoundError || e instanceof ForbiddenError)) {
          return next(e);
        }

        moderation_id = undefined;
      }
    }

    return res.render("help", {
      pageTitle: "Aide",
      email,
      csrfToken: email && csrfToken(req),
      organization_label: cached_libelle,
      moderation_id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * list the pages handled with the external CMS
 *
 * Record of <internalSlug, externalSlug>
 */
const EXISTING_EXTERNAL_PAGES: Record<string, string> = {
  accessibilite: "moncomptepro-accessibilite",
  confidentialite: "moncomptepro-politique-de-confidentialite",
  "conditions-generales": "moncomptepro-conditions-generales-d-utilisation",
};

export const getLegalPageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.params.slug || !EXISTING_EXTERNAL_PAGES[req.params.slug]) {
    return next(new NotFoundError());
  }

  const existingPage = await findPageBySlug(req.params.slug);
  const content = {
    body: existingPage?.body || "",
    title: existingPage?.title || "",
  };

  // if the page is not in the database, or if it was updated more than a day ago and we want to update content automatically, fetch content
  const mustFetchContent =
    req.query.refresh === "1" ||
    !existingPage ||
    (AUTOUPDATE_EXTERNAL_CONTENT &&
      existingPage.updated_at < new Date(Date.now() - 86400000));

  if (mustFetchContent) {
    const freshContent = await getExternalContent(
      EXISTING_EXTERNAL_PAGES[req.params.slug],
    );
    if (freshContent) {
      content.body = freshContent.body;
      content.title = freshContent.title;
    }
  }
  const hasFreshContent = mustFetchContent && !!content.body;
  if (hasFreshContent && existingPage) {
    updatePage({
      ...existingPage,
      ...content,
    });
  }
  if (hasFreshContent && !existingPage) {
    createPage({
      slug: req.params.slug,
      ...content,
    });
  }

  return res.render("legal-page", {
    pageTitle: content.title,
    body: content.body,
    notifications: await getNotificationsFromRequest(req),
  });
};
