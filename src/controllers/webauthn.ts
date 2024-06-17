import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod";
import {
  NotFoundError,
  UserNotLoggedInError,
  WebauthnAuthenticationFailedError,
  WebauthnRegistrationFailedError,
} from "../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  createAuthenticatedSession,
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  deleteUserAuthenticator,
  getAuthenticationOptions,
  getRegistrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from "../managers/webauthn";
import { csrfToken } from "../middlewares/csrf-protection";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { logger } from "../services/log";
import { getEmailFromUnauthenticatedSession } from "../managers/session/unauthenticated";

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

    const user = getUserFromAuthenticatedSession(req);

    await deleteUserAuthenticator(user.email, credential_id);

    return res.redirect(
      `/connection-and-account?notification=passkey_successfully_deleted`,
    );
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
    const user = getUserFromAuthenticatedSession(req);

    const { updatedUser, registrationOptions } = await getRegistrationOptions(
      user.email,
    );
    updateUserInAuthenticatedSession(req, updatedUser);

    return res.json(registrationOptions);
  } catch (e) {
    if (e instanceof UserNotLoggedInError) {
      return next(new HttpErrors.Unauthorized());
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

    const user = getUserFromAuthenticatedSession(req);

    const { userVerified, user: updatedUser } = await verifyRegistration({
      email: user.email,
      response,
    });
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "pop");
    if (userVerified) {
      addAuthenticationMethodReferenceInSession(req, res, updatedUser, "uv");
    }

    return res.redirect(
      `/connection-and-account?notification=passkey_successfully_created`,
    );
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError || e instanceof WebauthnRegistrationFailedError) {
      return res.redirect(
        `/connection-and-account?notification=invalid_passkey`,
      );
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
    const email = isWithinAuthenticatedSession(req.session)
      ? getUserFromAuthenticatedSession(req).email
      : getEmailFromUnauthenticatedSession(req);

    if (!email) {
      return next(new HttpErrors.Unauthorized());
    }

    const { authenticationOptions } = await getAuthenticationOptions(
      email,
      isWithinAuthenticatedSession(req.session),
    );

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

    const email = isWithinAuthenticatedSession(req.session)
      ? getUserFromAuthenticatedSession(req).email
      : getEmailFromUnauthenticatedSession(req);

    const { user, userVerified } = await verifyAuthentication({
      email,
      response,
      isOneFactorAuthenticated: isWithinAuthenticatedSession(req.session),
    });

    if (userVerified) {
      await createAuthenticatedSession(req, res, user, "pop");
      addAuthenticationMethodReferenceInSession(req, res, user, "uv");
    } else {
      addAuthenticationMethodReferenceInSession(req, res, user, "pop");
    }

    next();
  } catch (e) {
    logger.error(e);
    if (
      e instanceof ZodError ||
      e instanceof WebauthnAuthenticationFailedError
    ) {
      return res.redirect(
        `/users/${isWithinAuthenticatedSession(req.session) ? "2fa-sign-in" : "sign-in-with-passkey"}?notification=invalid_passkey`,
      );
    }

    if (e instanceof NotFoundError) {
      return res.redirect(
        `/users/${isWithinAuthenticatedSession(req.session) ? "2fa-sign-in" : "sign-in-with-passkey"}?notification=passkey_not_found`,
      );
    }

    next(e);
  }
};
