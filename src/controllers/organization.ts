import { NextFunction, Request, Response } from "express";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { z, ZodError } from "zod";
import {
  idSchema,
  optionalBooleanSchema,
  siretSchema,
} from "../services/custom-zod-schemas";
import hasErrorFromField from "../services/has-error-from-field";
import {
  InseeConnectionError,
  InseeNotActiveError,
  InvalidSiretError,
  NotFoundError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
} from "../config/errors";
import {
  quitOrganization,
  selectOrganization,
} from "../managers/organization/main";
import {
  doSuggestOrganizations,
  getOrganizationSuggestions,
  joinOrganization,
} from "../managers/organization/join";
import { getUserFromLoggedInSession } from "../managers/session";
import { csrfToken } from "../middlewares/csrf-protection";
import {
  cancelModeration,
  getOrganizationFromModeration,
} from "../managers/moderation";
import { NotFound } from "http-errors";

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

    const { id: user_id, email } = getUserFromLoggedInSession(req);

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
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationSuggestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: user_id, email } = getUserFromLoggedInSession(req);

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
      siret: siretSchema(),
    });

    const { siret } = await schema.parseAsync(req.body);

    const userOrganizationLink = await joinOrganization({
      siret,
      user_id: getUserFromLoggedInSession(req).id,
    });

    if (req.session.mustReturnOneOrganizationInPayload) {
      await selectOrganization({
        user_id: getUserFromLoggedInSession(req).id,
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
    const user = getUserFromLoggedInSession(req);

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
      next(new NotFound());
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
      const user = getUserFromLoggedInSession(req);

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
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.redirect(
      `/manage-organizations?notification=quit_organization_success`,
    );
  } catch (error) {
    next(error);
  }
};
