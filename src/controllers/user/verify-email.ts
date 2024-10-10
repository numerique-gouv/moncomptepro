import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  InvalidTokenError,
  NoNeedVerifyEmailAddressError,
} from "../../config/errors";
import { isBrowserTrustedForUser } from "../../managers/browser-authentication";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  sendEmailAddressVerificationEmail,
  verifyEmail,
} from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  codeSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

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

    const { email, needs_inclusionconnect_onboarding_help } =
      getUserFromAuthenticatedSession(req);

    const codeSent: boolean = await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req),
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
    if (error instanceof NoNeedVerifyEmailAddressError) {
      return res.redirect(
        `/users/personal-information?notification=no_need_to_verify_email_address`,
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
      verify_email_token: codeSchema(),
    });

    const { verify_email_token } = await schema.parseAsync(req.body);

    const { email } = getUserFromAuthenticatedSession(req);

    const updatedUser = await verifyEmail(email, verify_email_token);

    addAuthenticationMethodReferenceInSession(
      req,
      res,
      updatedUser,
      "email-otp",
    );

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
    const { email } = getUserFromAuthenticatedSession(req);

    await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req),
      force: true,
    });

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error instanceof NoNeedVerifyEmailAddressError) {
      return res.redirect(
        `/users/personal-information?notification=no_need_to_verify_email_address`,
      );
    }

    next(error);
  }
};

export const getVerificationCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let email: string | undefined;
    let user: User | undefined;

    if (isWithinAuthenticatedSession(req.session)) {
      user = getUserFromAuthenticatedSession(req);
      email = user.email;
    }

    return res.render("user/verify-email-help", {
      pageTitle: "Renvoyer un code",
      email,
      csrfToken: email && csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};
