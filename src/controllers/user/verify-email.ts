import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { optionalBooleanSchema } from "../../services/custom-zod-schemas";
import {
  sendEmailAddressVerificationEmail,
  verifyEmail,
} from "../../managers/user";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import {
  EmailVerifiedAlreadyError,
  InvalidTokenError,
} from "../../config/errors";
import {
  getUserFromLoggedInSession,
  updateUserInLoggedInSession,
} from "../../managers/session";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  isBrowserTrustedForUser,
  setBrowserAsTrustedForUser,
} from "../../managers/browser-authentication";

export const getVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      new_code_sent: optionalBooleanSchema(),
    });

    const { new_code_sent } = await schema.parseAsync(req.query);

    const {
      id: user_id,
      email,
      needs_inclusionconnect_onboarding_help,
    } = getUserFromLoggedInSession(req);

    const codeSent: boolean = await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req, user_id),
    });

    return res.render("user/verify-email", {
      pageTitle: "Vérifier votre email",
      notifications: await getNotificationsFromRequest(req),
      email,
      csrfToken: csrfToken(req),
      newCodeSent: new_code_sent,
      codeSent,
      needs_inclusionconnect_onboarding_help,
    });
  } catch (error) {
    if (error instanceof EmailVerifiedAlreadyError) {
      return res.redirect(
        `/users/personal-information?notification=email_verified_already`,
      );
    }

    next(error);
  }
};

export const postVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      verify_email_token: z
        .string()
        .trim()
        .min(1)
        .transform((val) => val.replace(/\s+/g, "")),
    });

    const { verify_email_token } = await schema.parseAsync(req.body);

    const { id: user_id, email } = getUserFromLoggedInSession(req);

    const updatedUser = await verifyEmail(email, verify_email_token);

    updateUserInLoggedInSession(req, updatedUser);
    setBrowserAsTrustedForUser(req, res, user_id);

    next();
  } catch (error) {
    if (error instanceof InvalidTokenError || error instanceof ZodError) {
      return res.redirect(
        `/users/verify-email?notification=invalid_verify_email_code`,
      );
    }

    next(error);
  }
};

export const postSendEmailVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromLoggedInSession(req);

    await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req, user_id),
      force: true,
    });

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error instanceof EmailVerifiedAlreadyError) {
      return res.redirect(
        `/users/personal-information?notification=email_verified_already`,
      );
    }

    next(error);
  }
};
