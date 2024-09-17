import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { z, ZodError } from "zod";
import {
  InseeConnectionError,
  InseeNotActiveError,
  InvalidSiretError,
  NotFoundError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserMustConfirmToJoinOrganizationError,
} from "../config/errors";
import {
  cancelModeration,
  getOrganizationFromModeration,
} from "../managers/moderation";
import {
  doSuggestOrganizations,
  getOrganizationSuggestions,
  joinOrganization,
} from "../managers/organization/join";
import {
  getOrganizationById,
  quitOrganization,
  selectOrganization,
} from "../managers/organization/main";
import { getUserFromAuthenticatedSession } from "../managers/session/authenticated";
import { csrfToken } from "../middlewares/csrf-protection";
import {
  idSchema,
  optionalBooleanSchema,
  siretSchema,
} from "../services/custom-zod-schemas";
import { getEmailDomain } from "../services/email";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import hasErrorFromField from "../services/has-error-from-field";

export const getJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      siret_hint: z.string().optional(),
      notification: z.string().optional(),
      do_not_propose_suggestions: optionalBooleanSchema(),
    });

    const { notification, siret_hint, do_not_propose_suggestions } =
      await schema.parseAsync(req.query);

    const { id: user_id, email } = getUserFromAuthenticatedSession(req);

    if (
      !siret_hint &&
      !notification &&
      !do_not_propose_suggestions &&
      (await doSuggestOrganizations({ user_id, email }))
    ) {
      return res.redirect("/users/organization-suggestions");
    }

    return res.render("user/join-organization", {
      pageTitle: "Rejoindre une organisation",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      siretHint: siret_hint,
      useGendarmerieSearchHint:
        getEmailDomain(email) === "gendarmerie.interieur.gouv.fr",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationSuggestionsController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id: user_id, email } = getUserFromAuthenticatedSession(req);

  const organizationSuggestions = await getOrganizationSuggestions({
    user_id,
    email,
  });

  return res.render("user/organization-suggestions", {
    pageTitle: "Votre organisation de rattachement",
    organizationSuggestions,
    csrfToken: csrfToken(req),
  });
};

export const postJoinOrganizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      confirmed: optionalBooleanSchema(),
      siret: siretSchema(),
    });

    const { confirmed, siret } = await schema.parseAsync(req.body);

    const userOrganizationLink = await joinOrganization({
      siret,
      user_id: getUserFromAuthenticatedSession(req).id,
      confirmed,
    });

    if (req.session.mustReturnOneOrganizationInPayload) {
      await selectOrganization({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id: userOrganizationLink.organization_id,
      });
    }

    next();
  } catch (error) {
    if (
      error instanceof UnableToAutoJoinOrganizationError ||
      error instanceof UserAlreadyAskedToJoinOrganizationError
    ) {
      return res.redirect(
        `/users/unable-to-auto-join-organization?moderation_id=${error.moderationId}`,
      );
    }

    if (
      error instanceof InvalidSiretError ||
      error instanceof InseeNotActiveError ||
      (error instanceof ZodError && hasErrorFromField(error, "siret"))
    ) {
      return res.redirect(
        `/users/join-organization?notification=invalid_siret&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof InseeConnectionError) {
      return res.redirect(
        `/users/join-organization?notification=insee_unexpected_error&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof UserInOrganizationAlreadyError) {
      return res.redirect(
        `/users/join-organization?notification=user_in_organization_already&siret_hint=${req.body.siret}`,
      );
    }

    if (error instanceof UserMustConfirmToJoinOrganizationError) {
      return res.redirect(
        `/users/join-organization-confirm?organization_id=${error.organizationId}`,
      );
    }

    next(error);
  }
};

export const getJoinOrganizationConfirmController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.query);

    const organization = await getOrganizationById(organization_id);

    if (isEmpty(organization)) {
      return next(new HttpErrors.NotFound());
    }

    return res.render("user/join-organization-confirm", {
      pageTitle: "Confirmer le rattachement",
      csrfToken: csrfToken(req),
      organization_label: organization.cached_libelle,
      email: getUserFromAuthenticatedSession(req).email,
      siret: organization.siret,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnableToAutoJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      moderation_id: idSchema(),
    });
    const { moderation_id } = await schema.parseAsync(req.query);
    const user = getUserFromAuthenticatedSession(req);

    const { cached_libelle } = await getOrganizationFromModeration({
      user,
      moderation_id,
    });

    return res.render("user/unable-to-auto-join-organization", {
      pageTitle: "Rattachement en cours",
      csrfToken: csrfToken(req),
      email: user.email,
      organization_label: cached_libelle,
      moderation_id,
    });
  } catch (e) {
    if (e instanceof NotFoundError) {
      next(new HttpErrors.NotFound());
    }

    next(e);
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
      next(e);
    }
  };

export const postQuitUserOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      id: idSchema(),
    });

    const { id: organization_id } = await schema.parseAsync(req.params);

    await quitOrganization({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id,
    });

    return res.redirect(
      `/manage-organizations?notification=quit_organization_success`,
    );
  } catch (error) {
    next(error);
  }
};
