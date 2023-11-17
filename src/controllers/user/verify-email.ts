import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { optionalBooleanSchema } from '../../services/custom-zod-schemas';
import {
  sendEmailAddressVerificationEmail,
  verifyEmail,
} from '../../managers/user';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import {
  EmailVerifiedAlreadyError,
  InvalidTokenError,
} from '../../config/errors';
import {
  getUserFromLoggedInSession,
  updateUserInLoggedInSession,
} from '../../managers/session';
import { csrfToken } from '../../middlewares/csrf-protection';

export const getVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        new_code_sent: optionalBooleanSchema(),
      }),
    });

    const {
      query: { new_code_sent },
    } = await schema.parseAsync({
      query: req.query,
    });

    const codeSent: boolean = await sendEmailAddressVerificationEmail({
      email: getUserFromLoggedInSession(req).email,
      checkBeforeSend: true,
    });

    return res.render('user/verify-email', {
      notifications: await getNotificationsFromRequest(req),
      email: getUserFromLoggedInSession(req).email,
      csrfToken: csrfToken(req),
      newCodeSent: new_code_sent,
      codeSent,
    });
  } catch (error) {
    if (error instanceof EmailVerifiedAlreadyError) {
      return res.redirect(
        `/users/personal-information?notification=email_verified_already`
      );
    }

    next(error);
  }
};

export const postVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        verify_email_token: z
          .string()
          .min(1)
          .transform((val) => val.replace(/\s+/g, '')),
      }),
    });

    const {
      body: { verify_email_token },
    } = await schema.parseAsync({
      body: req.body,
    });

    const updatedUser = await verifyEmail(
      getUserFromLoggedInSession(req).email,
      verify_email_token
    );

    await updateUserInLoggedInSession(req, updatedUser);

    next();
  } catch (error) {
    if (error instanceof InvalidTokenError || error instanceof ZodError) {
      return res.redirect(
        `/users/verify-email?notification=invalid_verify_email_code`
      );
    }

    next(error);
  }
};

export const postSendEmailVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await sendEmailAddressVerificationEmail({
      email: getUserFromLoggedInSession(req).email,
      checkBeforeSend: false,
    });

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error instanceof EmailVerifiedAlreadyError) {
      return res.redirect(
        `/users/personal-information?notification=email_verified_already`
      );
    }

    next(error);
  }
};
