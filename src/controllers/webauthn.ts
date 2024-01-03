import { NextFunction, Request, Response } from "express";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import {
  createLoggedInSession,
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
  updateUserInLoggedInSession,
} from "../managers/session";
import {
  deleteUserAuthenticator,
  getAuthenticationOptions,
  getRegistrationOptions,
  getUserAuthenticators,
  verifyAuthentication,
  verifyRegistration,
} from "../managers/webauthn";
import { z, ZodError } from "zod";
import { BadRequest } from "http-errors";
import { WebauthnRegistrationFailedError } from "../config/errors";
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server/esm/deps";
import { setBrowserAsTrustedForUser } from "../managers/browser-authentication";
import { csrfToken } from "../middlewares/csrf-protection";

export const getPasskeysController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const passkeys = await getUserAuthenticators(user.email);

    return res.render("passkeys", {
      notifications: await getNotificationsFromRequest(req),
      passkeys,
      csrfToken: csrfToken(req),
    });
  } catch (e) {
    next(e);
  }
};

export const deletePasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsSchema = z.object({
      credential_id: z.string(),
    });
    const { credential_id } = paramsSchema.parse(req.params);

    const user = getUserFromLoggedInSession(req);

    await deleteUserAuthenticator(user.email, credential_id);

    return res.redirect(`/passkeys?notification=passkey_successfully_deleted`);
  } catch (e) {
    next(e);
  }
};

export const getSignInWithPasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/sign-in-with-passkey", {
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (e) {
    next(e);
  }
};

export const getGenerateRegistrationOptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const { updatedUser, registrationOptions } = await getRegistrationOptions(
      user.email,
    );
    updateUserInLoggedInSession(req, updatedUser);

    return res.json(registrationOptions);
  } catch (e) {
    next(e);
  }
};

export const postVerifyRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      registration_response_string: z.string(),
    });
    const { registration_response_string } = await schema.parseAsync(req.body);

    const registrationResponseJson = JSON.parse(registration_response_string);
    const registrationResponseSchema = z.custom<RegistrationResponseJSON>();

    const response = await registrationResponseSchema.parseAsync(
      registrationResponseJson,
    );

    const user = getUserFromLoggedInSession(req);

    await verifyRegistration({
      email: user.email,
      response,
    });

    return res.redirect(`/passkeys?notification=passkey_successfully_created`);
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
  next: NextFunction,
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

export const postVerifyAuthenticationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
