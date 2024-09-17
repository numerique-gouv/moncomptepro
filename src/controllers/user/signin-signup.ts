import * as Sentry from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { DISPLAY_TEST_ENV_WARNING } from "../../config/env";
import {
  EmailUnavailableError,
  InvalidCredentialsError,
  InvalidEmailError,
  LeakedPasswordError,
  WeakPasswordError,
} from "../../config/errors";
import { createAuthenticatedSession } from "../../managers/session/authenticated";
import {
  getEmailFromUnauthenticatedSession,
  setEmailInUnauthenticatedSession,
  setPartialUserFromUnauthenticatedSession,
  updatePartialUserFromUnauthenticatedSession,
} from "../../managers/session/unauthenticated";
import {
  loginWithPassword,
  signupWithPassword,
  startLogin,
} from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { emailSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../../services/get-notifications-from-request";

export const getStartSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      did_you_mean: z.string().trim().min(1).optional(),
    });

    const { did_you_mean: didYouMean } = await schema.parseAsync(req.query);

    const loginHint = getEmailFromUnauthenticatedSession(req);

    const hasEmailError =
      (await getNotificationLabelFromRequest(req)) === "invalid_email";

    return res.render("user/start-sign-in", {
      pageTitle: "S'inscrire ou se connecter",
      notifications: !hasEmailError && (await getNotificationsFromRequest(req)),
      hasEmailError,
      didYouMean,
      loginHint,
      csrfToken: csrfToken(req),
      displayTestEnvWarning: DISPLAY_TEST_ENV_WARNING,
    });
  } catch (error) {
    next(error);
  }
};

export const postStartSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      login: emailSchema(),
    });

    const { login } = await schema.parseAsync(req.body);

    const {
      email,
      userExists,
      hasAPassword,
      needsInclusionconnectWelcomePage,
    } = await startLogin(login);
    setPartialUserFromUnauthenticatedSession(req, {
      email,
      needsInclusionconnectWelcomePage,
    });

    if (needsInclusionconnectWelcomePage) {
      return res.redirect(`/users/inclusionconnect-welcome`);
    } else if (userExists && hasAPassword) {
      return res.redirect(`/users/sign-in`);
    } else if (userExists && !hasAPassword) {
      return res.redirect(`/users/sign-up?notification=new_password_needed`);
    } else {
      return res.redirect("/users/sign-up");
    }
  } catch (error) {
    if (error instanceof InvalidEmailError) {
      const didYouMeanQueryParam = error?.didYouMean
        ? `&did_you_mean=${error.didYouMean}`
        : "";

      setEmailInUnauthenticatedSession(req, req.body.login);
      return res.redirect(
        `/users/start-sign-in?notification=invalid_email${didYouMeanQueryParam}`,
      );
    }

    if (error instanceof ZodError) {
      setEmailInUnauthenticatedSession(req, req.body.login);
      return res.redirect(`/users/start-sign-in?notification=invalid_email`);
    }

    next(error);
  }
};

export const getInclusionconnectWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/inclusionconnect-welcome", {
      pageTitle: "Première connexion",
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postInclusionconnectWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updatePartialUserFromUnauthenticatedSession(req, {
      needs_inclusionconnect_welcome_page: false,
    });

    return res.redirect("/users/sign-up?notification=new_password_needed");
  } catch (error) {
    next(error);
  }
};

export const getSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/sign-in", {
      pageTitle: "Accéder au compte",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      email: getEmailFromUnauthenticatedSession(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postSignInMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      password: z.string().trim().min(1),
    });

    const { password } = await schema.parseAsync(req.body);

    const user = await loginWithPassword(
      getEmailFromUnauthenticatedSession(req)!,
      password,
    );

    await createAuthenticatedSession(req, res, user, "pwd");

    next();
  } catch (error) {
    if (error instanceof InvalidCredentialsError || error instanceof ZodError) {
      return res.redirect(`/users/sign-in?notification=invalid_credentials`);
    }

    next(error);
  }
};

export const getSignUpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      login_hint: emailSchema().optional(),
    });

    const { login_hint } = await schema.parseAsync(req.query);

    return res.render("user/sign-up", {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      loginHint: login_hint,
      email: getEmailFromUnauthenticatedSession(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postSignUpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      body: z.object({
        password: z.string().trim().min(1),
      }),
    });

    const {
      body: { password },
    } = await schema.parseAsync({
      body: req.body,
    });

    const user = await signupWithPassword(
      getEmailFromUnauthenticatedSession(req)!,
      password,
    );

    await createAuthenticatedSession(req, res, user, "pwd");

    next();
  } catch (error) {
    if (error instanceof EmailUnavailableError) {
      return res.redirect(
        `/users/start-sign-in?notification=email_unavailable`,
      );
    }
    if (error instanceof WeakPasswordError) {
      Sentry.captureException(error);
      return res.redirect(`/users/sign-up?notification=weak_password`);
    }
    if (error instanceof LeakedPasswordError) {
      return res.redirect(`/users/sign-up?notification=leaked_password`);
    }
    if (error instanceof ZodError) {
      return res.redirect(`/users/sign-up?notification=invalid_credentials`);
    }

    next(error);
  }
};
