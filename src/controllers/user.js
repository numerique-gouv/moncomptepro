import { isEmpty } from 'lodash';

import notificationMessages from '../notificationMessages';
import {
  changePassword,
  login,
  sendEmailAddressVerificationEmail,
  sendResetPasswordEmail,
  signup,
  verifyEmail,
} from '../models/user-manager';
import { getOrganizationsByUserId } from '../models/organization-manager';

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

export const postSignInController = async (req, res, next) => {
  try {
    req.session.user = await login(req.body.login, req.body.password);

    if (isEmpty(await getOrganizationsByUserId(req.session.user.id))) {
      return res.redirect(
        `/users/join-organization?notification=organization_needed`
      );
    }

    // Note that if the user make a sign in attempt with no email_verify and no organization,
    // only the organization check will be triggered not the email_verified check below.
    if (!req.session.user.email_verified) {
      return res.redirect(
        `/users/send-email-verification?notification=email_verification_required`
      );
    }

    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    }

    if (req.body.referer) {
      return res.redirect(req.body.referer);
    }

    return res.redirect('https://api.gouv.fr/rechercher-api?filter=signup');
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

export const postSignUpController = async (req, res, next) => {
  try {
    req.session.user = await signup(
      req.body.given_name,
      req.body.family_name,
      req.body.login,
      req.body.password
    );

    await sendEmailAddressVerificationEmail(req.session.user.email);

    return res.redirect(`/users/join-organization?notification=signup_step2`);
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
  try {
    const verifyEmailToken = req.query.verify_email_token;

    await verifyEmail(verifyEmailToken);

    return res.redirect(
      `/users/send-email-verification?notification=verify_email_success`
    );
  } catch (error) {
    if (error.message === 'invalid_token') {
      return res.redirect(
        `/users/send-email-verification?notification=invalid_token`
      );
    }

    next(error);
  }
};

export const getSendEmailVerificationController = async (req, res, next) => {
  if (isEmpty(req.session.user)) {
    // user must be logged in to access this page
    const notificationParams = req.query.notification
      ? `?notification=${req.query.notification}`
      : '';

    return res.redirect(
      `/users/sign-in${notificationParams}?referer=/users/send-email-verification`
    );
  }

  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('send-email-verification', {
    notifications,
    displaySendEmailButton: ![
      'verify_email_success',
      'email_verification_sent',
      'email_verified_already',
    ].includes(req.query.notification),
    csrfToken: req.csrfToken(),
    continueLink:
      req.query.notification === 'verify_email_success' &&
      req.session.interactionId
        ? `/interaction/${req.session.interactionId}/login`
        : null,
  });
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
      `/users/send-email-verification?notification=email_verification_sent`
    );
  } catch (error) {
    if (error.message === 'email_verified_already') {
      return res.redirect(
        `/users/send-email-verification?notification=${error.message}`
      );
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
