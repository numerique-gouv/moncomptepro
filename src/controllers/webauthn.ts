import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import {
  createLoggedInSession,
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
  updateUserInLoggedInSession,
} from '../managers/session';
import {
  getAuthenticationOptions,
  getRegistrationOptions,
  getUserAuthenticators,
  verifyAuthentication,
  verifyRegistration,
} from '../managers/webauthn';
import { z, ZodError } from 'zod';
import { BadRequest } from 'http-errors';
import { WebauthnRegistrationFailedError } from '../config/errors';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server/esm/deps';
import { setBrowserAsTrustedForUser } from '../managers/browser-authentication';

export const getPasskeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const passkeys = await getUserAuthenticators(user.email);

    return res.render('passkeys', {
      notifications: await getNotificationsFromRequest(req),
      passkeys,
    });
  } catch (e) {
    next(e);
  }
};

export const getSignInWithPasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/sign-in-with-passkey', {
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
      user.email
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
      email: user.email,
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

export const getGenerateAuthenticationOptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = isWithinLoggedInSession(req)
      ? getUserFromLoggedInSession(req).email
      : req.session.email;

    const { updatedUser, authenticationOptions } =
      await getAuthenticationOptions(email);

    if (isWithinLoggedInSession(req)) {
      updateUserInLoggedInSession(req, updatedUser);
    }

    return res.json(authenticationOptions);
  } catch (e) {
    next(e);
  }
};

export const getVerifyAuthenticationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.custom<AuthenticationResponseJSON>(),
    });

    const { body: response } = await schema.parseAsync({
      body: req.body,
    });

    const email = isWithinLoggedInSession(req)
      ? getUserFromLoggedInSession(req).email
      : req.session.email;

    const { user, verified } = await verifyAuthentication({
      email,
      response,
    });

    await createLoggedInSession(req, user);
    setBrowserAsTrustedForUser(req, res, user.id);

    return res.json({ verified });
  } catch (e) {
    console.error(e);
    if (e instanceof ZodError || e instanceof WebauthnRegistrationFailedError) {
      return next(new BadRequest());
    }

    next(e);
  }
};
