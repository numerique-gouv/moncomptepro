import {
  changePassword,
  login,
  loginWithMagicLink,
  sendEmailAddressVerificationEmail,
  sendResetPasswordEmail,
  sendSendMagicLinkEmail,
  signup,
  startLogin,
  updatePersonalInformations,
  verifyEmail,
} from '../managers/user';

import { isUrlTrusted } from '../services/security';
import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import {
  emailSchema,
  optionalBooleanSchema,
} from '../services/custom-zod-schemas';
import hasErrorFromField from '../services/has-error-from-field';

export const issueSessionOrRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    }

    if (req.session.referer && isUrlTrusted(req.session.referer)) {
      // copy string by value
      const referer = `${req.session.referer}`;
      // then delete referer value from session
      req.session.referer = undefined;
      return res.redirect(referer);
    }

    return res.redirect('/');
  } catch (error) {
    next(error);
  }
};

export const getStartSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        login_hint: z
          .string()
          .min(1)
          .optional(),
      }),
    });

    const {
      query: { login_hint },
    } = await schema.parseAsync({
      query: req.query,
    });

    const loginHint = login_hint || req.session.email;

    return res.render('start-sign-in', {
      notifications: await getNotificationsFromRequest(req),
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
    if (
      (error instanceof Error && error.message === 'invalid_email') ||
      error instanceof ZodError
    ) {
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
    return res.render('sign-in', {
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

    req.session.user = await login(req.session.email, password);
    req.session.email = undefined;

    next();
  } catch (error) {
    if (
      (error instanceof Error && error.message === 'invalid_credentials') ||
      error instanceof ZodError
    ) {
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

    return res.render('sign-up', {
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

    req.session.user = await signup(req.session.email, password);
    req.session.email = undefined;

    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'email_unavailable') {
      return res.redirect(
        `/users/start-sign-in?notification=email_unavailable`
      );
    }
    if (error instanceof Error && error.message === 'weak_password') {
      return res.redirect(`/users/sign-up?notification=weak_password`);
    }
    if (error instanceof ZodError) {
      return res.redirect(`/users/sign-up?notification=invalid_credentials`);
    }

    next(error);
  }
};

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
      email: req.session.user.email,
      checkBeforeSend: true,
    });

    return res.render('verify-email', {
      notifications: await getNotificationsFromRequest(req),
      email: req.session.user.email,
      csrfToken: req.csrfToken(),
      newCodeSent: new_code_sent,
      codeSent,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'email_verified_already') {
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
        verify_email_token: z.string().min(1),
      }),
    });

    const {
      body: { verify_email_token },
    } = await schema.parseAsync({
      body: req.body,
    });

    req.session.user = await verifyEmail(
      req.session.user.email,
      verify_email_token
    );

    next();
  } catch (error) {
    if (
      (error instanceof Error && error.message === 'invalid_token') ||
      error instanceof ZodError
    ) {
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
      email: req.session.user.email,
      checkBeforeSend: false,
    });

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error instanceof Error && error.message === 'email_verified_already') {
      return res.redirect(
        `/users/personal-information?notification=${error.message}`
      );
    }

    next(error);
  }
};

export const postSendMagicLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await sendSendMagicLinkEmail(req.session.email, req.get('origin'));

    return res.redirect(`/users/magic-link-sent`);
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid_email') {
      return res.redirect(`/users/start-sign-in?notification=invalid_email`);
    }

    next(error);
  }
};

export const getMagicLinkSentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.session.email;
    return res.render('magic-link-sent', { email });
  } catch (error) {
    next(error);
  }
};

export const getSignInWithMagicLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        magic_link_token: z.string().min(1),
      }),
    });

    const {
      query: { magic_link_token },
    } = await schema.parseAsync({
      query: req.query,
    });

    req.session.user = await loginWithMagicLink(magic_link_token);
    req.session.email = undefined;

    next();
  } catch (error) {
    if (
      (error instanceof Error && error.message === 'invalid_magic_link') ||
      error instanceof ZodError
    ) {
      return res.redirect(
        `/users/start-sign-in?notification=invalid_magic_link`
      );
    }

    next(error);
  }
};

export const getResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('reset-password', {
      notifications: await getNotificationsFromRequest(req),
      loginHint:
        req.session.email || (req.session.user && req.session.user.email),
      csrfToken: req.csrfToken(),
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

    await sendResetPasswordEmail(login, req.get('origin'));

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

    return res.render('change-password', {
      resetPasswordToken: reset_password_token,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
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
      (error instanceof Error && error.message === 'invalid_token') ||
      (error instanceof ZodError &&
        hasErrorFromField(error, 'reset_password_token'))
    ) {
      return res.redirect(`/users/reset-password?notification=invalid_token`);
    }
    if (
      (error instanceof Error && error.message === 'weak_password') ||
      (error instanceof ZodError && hasErrorFromField(error, 'password'))
    ) {
      const resetPasswordToken = req.body.reset_password_token;

      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=weak_password`
      );
    }

    next(error);
  }
};

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('personal-information', {
      given_name: req.session.user.given_name,
      family_name: req.session.user.family_name,
      phone_number: req.session.user.phone_number,
      job: req.session.user.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        given_name: z.string().min(1),
        family_name: z.string().min(1),
        phone_number: z.string().min(1),
        job: z.string().min(1),
      }),
    });

    const {
      body: { given_name, family_name, phone_number, job },
    } = await schema.parseAsync({
      body: req.body,
    });

    req.session.user = await updatePersonalInformations(req.session.user.id, {
      given_name,
      family_name,
      phone_number,
      job,
    });

    next();
  } catch (error) {
    if (
      (error instanceof Error &&
        error.message === 'invalid_personal_informations') ||
      error instanceof ZodError
    ) {
      return res.redirect(
        `/users/personal-information?notification=invalid_personal_informations`
      );
    }

    next(error);
  }
};
