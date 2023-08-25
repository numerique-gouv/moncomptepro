import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from '../../services/get-notifications-from-request';
import { z, ZodError } from 'zod';
import { login, signup, startLogin } from '../../managers/user';
import {
  EmailUnavailableError,
  InvalidCredentialsError,
  InvalidEmailError,
  WeakPasswordError,
} from '../../errors';
import { emailSchema } from '../../services/custom-zod-schemas';
import { createLoggedInSession } from '../../managers/session';

export const getStartSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        did_you_mean: z.string().min(1).optional(),
      }),
    });

    const {
      query: { did_you_mean: didYouMean },
    } = await schema.parseAsync({
      query: req.query,
    });

    const loginHint = req.session.loginHint || req.session.email;

    const hasEmailError =
      (await getNotificationLabelFromRequest(req)) === 'invalid_email';

    return res.render('user/start-sign-in', {
      notifications: !hasEmailError && (await getNotificationsFromRequest(req)),
      hasEmailError,
      didYouMean,
      loginHint,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postStartSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        login: emailSchema(),
      }),
    });

    const {
      body: { login },
    } = await schema.parseAsync({
      body: req.body,
    });

    const { email, userExists } = await startLogin(login);
    req.session.email = email;

    return res.redirect(`/users/${userExists ? 'sign-in' : 'sign-up'}`);
  } catch (error) {
    if (error instanceof InvalidEmailError) {
      const didYouMeanQueryParam = error?.didYouMean
        ? `&did_you_mean=${error.didYouMean}`
        : '';

      return res.redirect(
        `/users/start-sign-in?notification=invalid_email&login_hint=${req.body.login}${didYouMeanQueryParam}`
      );
    }

    if (error instanceof ZodError) {
      return res.redirect(
        `/users/start-sign-in?notification=invalid_email&login_hint=${req.body.login}`
      );
    }

    next(error);
  }
};

export const getSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/sign-in', {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postSignInMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        password: z.string().min(1),
      }),
    });

    const {
      body: { password },
    } = await schema.parseAsync({
      body: req.body,
    });

    const user = await login(req.session.email!, password);
    await createLoggedInSession(req, user);

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
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        login_hint: emailSchema().optional(),
      }),
    });

    const {
      query: { login_hint },
    } = await schema.parseAsync({
      query: req.query,
    });

    return res.render('user/sign-up', {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
      loginHint: login_hint,
    });
  } catch (error) {
    next(error);
  }
};

export const postSignUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        password: z.string().min(1),
      }),
    });

    const {
      body: { password },
    } = await schema.parseAsync({
      body: req.body,
    });

    const user = await signup(req.session.email!, password);
    await createLoggedInSession(req, user);

    next();
  } catch (error) {
    if (error instanceof EmailUnavailableError) {
      return res.redirect(
        `/users/start-sign-in?notification=email_unavailable`
      );
    }
    if (error instanceof WeakPasswordError) {
      return res.redirect(`/users/sign-up?notification=weak_password`);
    }
    if (error instanceof ZodError) {
      return res.redirect(`/users/sign-up?notification=invalid_credentials`);
    }

    next(error);
  }
};
