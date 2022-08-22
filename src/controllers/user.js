import { isEmpty } from 'lodash';
import { getOrganizationsByUserId } from '../managers/organization';
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

import notificationMessages from '../notificationMessages';
import { isUrlTrusted } from '../services/security';

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = async (req, res, next) => {
  try {
    if (isEmpty(req.session.email)) {
      return res.redirect(`/users/start-sign-in`);
    }

    return next();
  } catch (error) {
    next(error);
  }
};

// redirect user to login page if no active session is available
export const checkUserIsConnectedMiddleware = async (req, res, next) => {
  try {
    if (isEmpty(req.session.user) && req.method === 'GET') {
      return res.redirect(`/users/start-sign-in`);
    }

    if (isEmpty(req.session.user)) {
      return next(new Error('user must be logged in to perform this action'));
    }

    return next();
  } catch (error) {
    next(error);
  }
};

export const checkUserIsVerifiedMiddleware = async (req, res, next) => {
  try {
    return checkUserIsConnectedMiddleware(req, res, () => {
      if (!req.session.user.email_verified) {
        return res.redirect(`/users/verify-email`);
      }

      return next();
    });
  } catch (error) {
    next(error);
  }
};

export const checkUserHasPersonalInformationsMiddleware = async (
  req,
  res,
  next
) => {
  try {
    return checkUserIsVerifiedMiddleware(req, res, async () => {
      const { given_name, family_name, phone_number, job } = req.session.user;
      if (
        isEmpty(given_name) ||
        isEmpty(family_name) ||
        isEmpty(phone_number) ||
        isEmpty(job)
      ) {
        return res.redirect('/users/personal-information');
      }

      return next();
    });
  } catch (error) {
    next(error);
  }
};

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsMiddleware = async (req, res, next) => {
  try {
    return checkUserHasPersonalInformationsMiddleware(req, res, async () => {
      if (isEmpty(await getOrganizationsByUserId(req.session.user.id))) {
        return res.redirect('/users/join-organization');
      }

      return next();
    });
  } catch (error) {
    next(error);
  }
};

export const issueSessionOrRedirectControllerFactory = provider => async (
  req,
  res,
  next
) => {
  try {
    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    } else {
      await provider.setProviderSession(req, res, {
        account: req.session.user.id.toString(),
        remember: true,
      });
    }

    if (req.session.referer && isUrlTrusted(req.session.referer)) {
      // copy string by value
      const referer = `${req.session.referer}`;
      // then delete referer value from session
      req.session.referer = null;
      return res.redirect(referer);
    }

    return res.redirect('/');
  } catch (error) {
    next(error);
  }
};

export const getStartSignInController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    const loginHint = req.query.login_hint || req.session.email;

    return res.render('start-sign-in', {
      notifications,
      loginHint,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postStartSignInController = async (req, res, next) => {
  try {
    const { email, userExists } = await startLogin(req.body.login);
    req.session.email = email;

    return res.redirect(`/users/${userExists ? 'sign-in' : 'sign-up'}?`);
  } catch (error) {
    if (error.message === 'invalid_email') {
      return res.redirect(
        `/users/start-sign-in?notification=${error.message}&login_hint=${
          req.body.login
        }`
      );
    }

    next(error);
  }
};

export const getSignInController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    return res.render('sign-in', {
      notifications,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postSignInMiddleware = async (req, res, next) => {
  try {
    req.session.user = await login(req.session.email, req.body.password);
    req.session.email = null;

    next();
  } catch (error) {
    if (error.message === 'invalid_credentials') {
      return res.redirect(`/users/sign-in?notification=${error.message}`);
    }

    next(error);
  }
};

export const getSignUpController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    return res.render('sign-up', {
      notifications,
      csrfToken: req.csrfToken(),
      loginHint: req.query.login_hint,
    });
  } catch (error) {
    next(error);
  }
};

export const postSignUpController = async (req, res, next) => {
  try {
    req.session.user = await signup(req.session.email, req.body.password);
    req.session.email = null;

    next();
  } catch (error) {
    if (error.message === 'email_unavailable') {
      return res.redirect(`/users/start-sign-in?notification=${error.message}`);
    }
    if (error.message === 'weak_password') {
      return res.redirect(`/users/sign-up?notification=${error.message}`);
    }

    next(error);
  }
};

export const getVerifyEmailController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    const newCodeSent = req.query.new_code_sent;
    const codeSent = await sendEmailAddressVerificationEmail({
      email: req.session.user.email,
      checkBeforeSend: true,
    });

    return res.render('verify-email', {
      notifications,
      email: req.session.user.email,
      csrfToken: req.csrfToken(),
      newCodeSent,
      codeSent,
    });
  } catch (error) {
    if (error.message === 'email_verified_already') {
      return res.redirect(
        `/users/personal-information?notification=${error.message}`
      );
    }

    next(error);
  }
};

export const postVerifyEmailController = async (req, res, next) => {
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
    await sendEmailAddressVerificationEmail({
      email: req.session.user.email,
      checkBeforeSend: false,
    });

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error.message === 'email_verified_already') {
      return res.redirect(
        `/users/personal-information?notification=${error.message}`
      );
    }

    next(error);
  }
};

export const postSendMagicLinkController = async (req, res, next) => {
  try {
    await sendSendMagicLinkEmail(req.session.email);

    return res.redirect(`/users/magic-link-sent`);
  } catch (error) {
    if (error.message === 'invalid_email') {
      return res.redirect(`/users/start-sign-in?notification=${error.message}`);
    }

    next(error);
  }
};

export const getMagicLinkSentController = async (req, res, next) => {
  try {
    const email = req.session.email;
    return res.render('magic-link-sent', { email });
  } catch (error) {
    next(error);
  }
};

export const getSignInWithMagicLinkController = async (req, res, next) => {
  try {
    req.session.user = await loginWithMagicLink(req.query.magic_link_token);
    req.session.email = null;

    next();
  } catch (error) {
    if (error.message === 'invalid_magic_link') {
      return res.redirect(`/users/start-sign-in?notification=${error.message}`);
    }

    next(error);
  }
};

export const getResetPasswordController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    return res.render('reset-password', {
      notifications,
      loginHint: req.session.email,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postResetPasswordController = async (req, res, next) => {
  try {
    const login = req.body.login;

    await sendResetPasswordEmail(login);

    return res.redirect(
      `/users/start-sign-in?notification=reset_password_email_sent`
    );
  } catch (error) {
    next(error);
  }
};

export const getChangePasswordController = async (req, res, next) => {
  try {
    const resetPasswordToken = req.query.reset_password_token;

    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    return res.render('change-password', {
      resetPasswordToken,
      notifications,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postChangePasswordController = async (req, res, next) => {
  try {
    await changePassword(req.body.reset_password_token, req.body.password);

    return res.redirect(
      `/users/start-sign-in?notification=password_change_success`
    );
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

export const getPersonalInformationsController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    return res.render('personal-information', {
      given_name: req.session.user.given_name,
      family_name: req.session.user.family_name,
      phone_number: req.session.user.phone_number,
      job: req.session.user.job,
      notifications,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postPersonalInformationsController = async (req, res, next) => {
  try {
    const { given_name, family_name, phone_number, job } = req.body;

    req.session.user = await updatePersonalInformations(req.session.user.id, {
      given_name,
      family_name,
      phone_number,
      job,
    });

    next();
  } catch (error) {
    if (error.message === 'invalid_personal_informations') {
      return res.redirect(
        `/users/personal-information?notification=${error.message}`
      );
    }

    next(error);
  }
};
