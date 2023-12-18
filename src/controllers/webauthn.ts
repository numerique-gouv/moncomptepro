import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import {
  getUserFromLoggedInSession,
  updateUserInLoggedInSession,
} from '../managers/session';
import {
  getRegistrationOptions,
  verifyRegistration,
} from '../managers/webauthn';
import { z, ZodError } from 'zod';
import { BadRequest } from 'http-errors';
import { WebauthnRegistrationFailedError } from '../config/errors';
import { RegistrationResponseJSON } from '@simplewebauthn/server/esm/deps';

export const getPasskeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('passkeys', {
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (e) {
    next(e);
  }
};

export const getGenerateRegistrationOptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const { updatedUser, registrationOptions } = await getRegistrationOptions(
      user.id
    );
    updateUserInLoggedInSession(req, updatedUser);

    return res.json(registrationOptions);
  } catch (e) {
    next(e);
  }
};

export const getVerifyRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.custom<RegistrationResponseJSON>(),
    });

    const { body: response } = await schema.parseAsync({
      body: req.body,
    });

    const user = getUserFromLoggedInSession(req);

    const verification = await verifyRegistration({
      user_id: user.id,
      response,
    });

    return res.json(verification);
  } catch (e) {
    console.error(e);
    if (e instanceof ZodError || e instanceof WebauthnRegistrationFailedError) {
      return next(new BadRequest());
    }

    next(e);
  }
};
