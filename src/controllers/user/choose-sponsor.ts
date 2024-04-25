import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z } from "zod";
import {
  NotFoundError,
  UserHasAlreadyBeenAuthenticatedByPeers,
} from "../../config/errors";
import {
  chooseSponsor,
  getOrganizationLabel,
  getSponsorOptions,
  notifyAllMembers,
} from "../../managers/organization/authentication-by-peers";
import { getOrganizationById } from "../../managers/organization/main";
import { getUserFromLoggedInSession } from "../../managers/session";
import { csrfToken } from "../../middlewares/csrf-protection";
import { idSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

const { NotFound } = HttpErrors;
export const getChooseSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.params);

    const sponsorOptions = await getSponsorOptions({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    const { cached_libelle: libelle } =
      (await getOrganizationById(organization_id))!;

    return res.render("user/choose-sponsor", {
      pageTitle: "Sélectionner un parrain",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      organization_id,
      sponsorOptions,
      libelle,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    next(error);
  }
};

export const postChooseSponsorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
      body: z.object({
        sponsor_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
      body: { sponsor_id },
    } = await schema.parseAsync({
      params: req.params,
      body: req.body,
    });

    await chooseSponsor({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
      sponsor_id,
    });

    next();
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    next(error);
  }
};

export const getSponsorValidationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/sponsor-validation", {
      pageTitle: "Compte vérifié",
    });
  } catch (error) {
    next(error);
  }
};

export const getNoSponsorFoundController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.params);

    // we call this fonction only to ensure user is in organization
    await getOrganizationLabel({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.render("user/no-sponsor-found", {
      pageTitle: "Vérifier votre profil sans parrainage",
      csrfToken: csrfToken(req),
      organization_id,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    next(error);
  }
};

export const postNoSponsorFoundMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });

    const { organization_id } = await schema.parseAsync(req.params);

    await notifyAllMembers({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return next();
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    if (error instanceof UserHasAlreadyBeenAuthenticatedByPeers) {
      // fail silently
      return next();
    }

    next(error);
  }
};
