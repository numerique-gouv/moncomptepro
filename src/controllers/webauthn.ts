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
import {
  NotFoundError,
  UserNotLoggedInError,
  WebauthnRegistrationFailedError,
} from "../config/errors";
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server/esm/deps";
import { setBrowserAsTrustedForUser } from "../managers/browser-authentication";
import { csrfToken } from "../middlewares/csrf-protection";
import { Unauthorized } from "http-errors";
import { logger } from "../services/log";

export const getPasskeysController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromLoggedInSession(req);

    const passkeys = await getUserAuthenticators(user.email);

    return res.render("passkeys", {
      pageTitle: "Vos clés d'accès",
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
    const schema = z.object({
      credential_id: z.string(),
    });
    const { credential_id } = schema.parse(req.params);

    const user = getUserFromLoggedInSession(req);

    await deleteUserAuthenticator(user.email, credential_id);

    return res.redirect(`/passkeys?notification=passkey_successfully_deleted`);
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
    if (e instanceof UserNotLoggedInError) {
      return next(new Unauthorized());
    }

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
      webauthn_registration_response_string: z.string(),
    });
    const { webauthn_registration_response_string } = await schema.parseAsync(
      req.body,
    );

    const registrationResponseJson = JSON.parse(
      webauthn_registration_response_string,
    );
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
    logger.error(e);
    if (e instanceof ZodError || e instanceof WebauthnRegistrationFailedError) {
      return res.redirect(`/passkeys?notification=invalid_passkey`);
    }

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
      pageTitle: "Se connecter avec une clé d’accès",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (e) {
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

    if (!email) {
      return next(new Unauthorized());
    }

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
      webauthn_authentication_response_string: z.string(),
    });
    const { webauthn_authentication_response_string } = await schema.parseAsync(
      req.body,
    );

    const authenticationResponseJson = JSON.parse(
      webauthn_authentication_response_string,
    );
    const authenticationResponseSchema = z.custom<AuthenticationResponseJSON>();

    const response = await authenticationResponseSchema.parseAsync(
      authenticationResponseJson,
    );

    const email = isWithinLoggedInSession(req)
      ? getUserFromLoggedInSession(req).email
      : req.session.email;

    const { user, verified } = await verifyAuthentication({
      email,
      response,
    });

    await createLoggedInSession(req, user);
    setBrowserAsTrustedForUser(req, res, user.id);

    next();
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError || e instanceof WebauthnRegistrationFailedError) {
      return res.redirect(
        `/users/sign-in-with-passkey?notification=invalid_passkey`,
      );
    }

    if (e instanceof NotFoundError) {
      return res.redirect(
        `/users/sign-in-with-passkey?notification=passkey_not_found`,
      );
    }

    next(e);
  }
};
