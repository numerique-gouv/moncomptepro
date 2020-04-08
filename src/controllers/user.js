import { isEmpty } from 'lodash';

import notificationMessages from '../notificationMessages';
import {
  changePassword,
  login,
  sendEmailAddressVerificationEmail,
  sendResetPasswordEmail,
  signup,
  verifyEmail,
} from '../managers/user';
import { getOrganizationsByUserId } from '../managers/organization';

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsController = async (req, res, next) => {
  if (!req.session.user.email_verified) {
    await sendEmailAddressVerificationEmail(req.session.user.email);

    return res.redirect(`/users/verify-email`);
  }

  if (isEmpty(await getOrganizationsByUserId(req.session.user.id))) {
    return res.redirect('/users/join-organization');
  }

  if (req.session.interactionId) {
    return res.redirect(`/interaction/${req.session.interactionId}/login`);
  }

  if (req.body.referer) {
    return res.redirect(req.body.referer);
  }

  return res.redirect('https://api.gouv.fr/rechercher-api?filter=signup');
};

export const getSignInController = async (req, res, next) => {
  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('sign-in', {
    notifications,
    referer: req.query.referer,
    csrfToken: req.csrfToken(),
  });
};

export const postSignInMiddleware = async (req, res, next) => {
  try {
    req.session.user = await login(req.body.login, req.body.password);

    next();
  } catch (error) {
    if (error.message === 'invalid_credentials') {
      return res.redirect(`/users/sign-in?notification=${error.message}`);
    }

    next(error);
  }
};

export const getSignUpController = async (req, res, next) => {
  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('sign-up', {
    notifications,
    csrfToken: req.csrfToken(),
    loginHint: req.query.login_hint,
  });
};

export const postSignUpMiddleware = async (req, res, next) => {
  try {
    req.session.user = await signup(
      req.body.given_name,
      req.body.family_name,
      req.body.login,
      req.body.password
    );

    next();
  } catch (error) {
    if (
      error.message === 'email_unavailable' ||
      error.message === 'invalid_email'
    ) {
      return res.redirect(`/users/sign-up?notification=${error.message}`);
    }
    if (error.message === 'weak_password') {
      return res.redirect(
        `/users/sign-up?notification=${error.message}&login_hint=${
          req.body.login
        }`
      );
    }

    next(error);
  }
};

export const getVerifyEmailController = async (req, res, next) => {
  if (isEmpty(req.session.user)) {
    // user must be logged in to access this page
    const notificationParams = req.query.notification
      ? `?notification=${req.query.notification}`
      : '';

    return res.redirect(
      `/users/sign-in${notificationParams}?referer=/users/verify-email`
    );
  }

  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('verify-email', {
    notifications,
    email: req.session.user.email,
    csrfToken: req.csrfToken(),
  });
};

export const postVerifyEmailMiddleware = async (req, res, next) => {
  try {
    const verifyEmailToken = req.body.verify_email_token;

    req.session.user = await verifyEmail(verifyEmailToken);

    next();
  } catch (error) {
    if (error.message === 'invalid_token') {
      return res.redirect(
        `/users/verify-email?notification=invalid_verify_email_code`
      );
    }

    next(error);
  }
};

export const postSendEmailVerificationController = async (req, res, next) => {
  try {
    if (isEmpty(req.session.user)) {
      return next(
        new Error('user must be logged in to perform an email verification')
      );
    }

    await sendEmailAddressVerificationEmail(req.session.user.email);

    return res.redirect(
      `/users/verify-email?notification=email_verification_sent`
    );
  } catch (error) {
    if (error.message === 'email_verified_already') {
      return res.redirect(`/users/verify-email?notification=${error.message}`);
    }

    next(error);
  }
};

export const getResetPasswordController = async (req, res, next) => {
  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('reset-password', {
    notifications,
    csrfToken: req.csrfToken(),
  });
};

export const postResetPasswordController = async (req, res, next) => {
  try {
    const login = req.body.login;

    await sendResetPasswordEmail(login);

    return res.redirect(
      `/users/sign-in?notification=reset_password_email_sent`
    );
  } catch (error) {
    next(error);
  }
};

export const getChangePasswordController = async (req, res, next) => {
  const resetPasswordToken = req.query.reset_password_token;

  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('change-password', {
    resetPasswordToken,
    notifications,
    csrfToken: req.csrfToken(),
  });
};

export const postChangePasswordController = async (req, res, next) => {
  try {
    const resetPasswordToken = req.body.reset_password_token;

    if (req.body.password !== req.body.password_confirmation) {
      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=passwords_do_not_match`
      );
    }

    await changePassword(resetPasswordToken, req.body.password);

    return res.redirect(`/users/sign-in?notification=password_change_success`);
  } catch (error) {
    if (error.message === 'invalid_token') {
      return res.redirect(
        `/users/reset-password?notification=${error.message}`
      );
    }

    if (error.message === 'weak_password') {
      const resetPasswordToken = req.body.reset_password_token;

      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=${
          error.message
        }`
      );
    }

    next(error);
  }
};
