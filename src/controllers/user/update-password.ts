import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { emailSchema } from '../../services/custom-zod-schemas';
import { changePassword, sendResetPasswordEmail } from '../../managers/user';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import {
  InvalidTokenError,
  LeakedPasswordError,
  WeakPasswordError,
} from '../../errors';
import hasErrorFromField from '../../services/has-error-from-field';
import { MONCOMPTEPRO_HOST } from '../../env';
import {
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
} from '../../managers/session';
import { csrfToken } from '../../middlewares/csrf-protection';

export const getResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/reset-password', {
      notifications: await getNotificationsFromRequest(req),
      loginHint:
        req.session.email ||
        (isWithinLoggedInSession(req)
          ? getUserFromLoggedInSession(req).email
          : null),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postResetPasswordController = async (
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

    await sendResetPasswordEmail(login, MONCOMPTEPRO_HOST);

    return res.redirect(
      '/users/start-sign-in?notification=reset_password_email_sent'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect('/users/reset-password?notification=invalid_email');
    }

    next(error);
  }
};

export const getChangePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        reset_password_token: z.string().min(1),
      }),
    });

    const {
      query: { reset_password_token },
    } = await schema.parseAsync({
      query: req.query,
    });

    return res.render('user/change-password', {
      resetPasswordToken: reset_password_token,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postChangePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        reset_password_token: z.string().min(1),
        password: z.string().min(1),
      }),
    });

    const {
      body: { reset_password_token, password },
    } = await schema.parseAsync({
      body: req.body,
    });

    await changePassword(reset_password_token, password);

    return res.redirect(
      `/users/start-sign-in?notification=password_change_success`
    );
  } catch (error) {
    if (
      error instanceof InvalidTokenError ||
      (error instanceof ZodError &&
        hasErrorFromField(error, 'reset_password_token'))
    ) {
      return res.redirect(`/users/reset-password?notification=invalid_token`);
    }
    if (
      error instanceof WeakPasswordError ||
      (error instanceof ZodError && hasErrorFromField(error, 'password'))
    ) {
      const resetPasswordToken = req.body.reset_password_token;

      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=weak_password`
      );
    }

    if (error instanceof LeakedPasswordError) {
      const resetPasswordToken = req.body.reset_password_token;

      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=leaked_password`
      );
    }

    next(error);
  }
};
