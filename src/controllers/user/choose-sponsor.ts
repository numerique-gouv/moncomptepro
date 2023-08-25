import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { idSchema } from '../../services/custom-zod-schemas';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import {
  NotFoundError,
  UserAlreadyAskedForSponsorshipError,
} from '../../errors';
import { NotFound } from 'http-errors';
import { getOrganizationById } from '../../managers/organization/main';
import {
  askForSponsorship,
  chooseSponsor,
  getOrganizationLabel,
  getSponsorOptions,
} from '../../managers/organization/authentication-by-peers';
import { getUserFromLoggedInSession } from '../../managers/session';

export const getChooseSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    const sponsorOptions = await getSponsorOptions({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    const { cached_libelle: libelle } = (await getOrganizationById(
      organization_id
    ))!;

    return res.render('user/choose-sponsor', {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    return res.render('user/sponsor-validation');
  } catch (error) {
    next(error);
  }
};

export const getNoSponsorFoundController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    // we call this fonction only to ensure user is in organization
    await getOrganizationLabel({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.render('user/no-sponsor-found', {
      csrfToken: req.csrfToken(),
      organization_id,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    next(error);
  }
};

export const postNoSponsorFoundController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    await askForSponsorship({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.redirect(`/users/unable-to-find-sponsor/${organization_id}`);
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    if (error instanceof UserAlreadyAskedForSponsorshipError) {
      return res.redirect(
        `/users/unable-to-find-sponsor/${error.organization_id}`
      );
    }

    next(error);
  }
};

export const getUnableToFindSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    const libelle = await getOrganizationLabel({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.render('user/unable-to-find-sponsor', {
      libelle,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new NotFound());
    }

    next(error);
  }
};
