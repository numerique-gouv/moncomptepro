import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { idSchema } from '../../services/custom-zod-schemas';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import {
  chooseSponsor,
  getOrganizationById,
  getSponsorOptions,
} from '../../managers/organization';
import { NotFoundError } from '../../errors';
import { NotFound } from 'http-errors';

export const getChooseSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        id: idSchema(),
      }),
    });

    const {
      params: { id: organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    const sponsorOptions = await getSponsorOptions({
      user_id: req.session.user!.id,
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

export const postChooseSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        id: idSchema(),
      }),
      body: z.object({
        sponsor_id: idSchema(),
      }),
    });

    const {
      params: { id: organization_id },
      body: { sponsor_id },
    } = await schema.parseAsync({
      params: req.params,
      body: req.body,
    });

    await chooseSponsor({
      user_id: req.session.user!.id,
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
    return res.render('user/no-sponsor-found', {
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postNoSponsorFoundController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO send mail
    // TODO create moderation
    return res.redirect('/users/unable-to-find-sponsor');
  } catch (error) {
    next(error);
  }
};

export const getUnableToFindSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/unable-to-find-sponsor');
  } catch (e) {
    next(e);
  }
};
