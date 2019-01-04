import { urlencoded } from 'express';
import { isEmpty } from 'lodash';
import csrf from 'csurf';

import {
  changePassword,
  login,
  sendResetPasswordEmail,
  signup,
} from './services/user-manager';
import { rateLimiterMiddleware } from './services/rate-limiter';

module.exports = (app, provider) => {
  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = provider;

  const csrfProtection = csrf();

  app.use((req, res, next) => {
    // cheap layout implementation for ejs
    const orig = res.render;
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        orig.call(res, '_layout', {
          ...locals,
          body: html,
        });
      });
    };
    next();
  });

  app.use(/^\/(users|interaction)/, (req, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  app.use(/^\/(users|interaction)/, urlencoded({ extended: false }));

  const errorMessages = {
    invalid_credentials: {
      type: 'error',
      message: 'Email ou mot de passe incorrect.',
    },
    invalid_token: {
      type: 'warning',
      message: 'Votre lien a expiré. Merci de recommencer cette procédure.',
    },
    password_change_success: {
      type: 'success',
      message: 'Votre mot de passe a été mis à jour.',
    },
    passwords_do_not_match: {
      type: 'error',
      message: 'Les mots de passe ne correspondent pas.',
    },
    reset_password_email_sent: {
      type: 'info',
      message: 'Vous allez recevoir un lien de réinitialisation par e-mail.',
    },
    username_unavailable: {
      type: 'warning',
      message: `Un compte existe déjà avec cet email.
      Cliquez sur "J'ai déjà un compte" pour vous connecter.
      Si vous avez oublié votre mot de passe cliquez sur "Mot de passe oublié ?".`,
    },
    weak_password: {
      type: 'error',
      message:
        "Votre mot de passe est trop court. Merci de choisir un mot de passe d'au moins 10 caractères",
    },
  };

  app.get('/interaction/:grant', async (req, res, next) => {
    try {
      const {
        uuid: interactionId,
        interaction: { error, error_description },
      } = await provider.interactionDetails(req);

      req.session.interactionId = interactionId;

      if (error === 'login_required') {
        return res.redirect(`/users/sign-in`);
      }

      if (error === 'consent_required') {
        // If consent is required, we redirect the user to the end of the login process
        // There, his consent will be accepted by default.
        return res.redirect(`/interaction/${req.params.grant}/login`);
      }

      return res.render('error', {
        error_code: error,
        error_message: error_description,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/interaction/:grant/login', async (req, res, next) => {
    try {
      if (isEmpty(req.session.user)) {
        return next(new Error('user not in session'));
      }

      const result = {
        login: {
          account: req.session.user.id,
          acr: 'urn:mace:incommon:iap:bronze',
          amr: ['pwd'],
          ts: Math.floor(Date.now() / 1000),
        },
        // We assume all oidc_clients can access the user data without asking for his consent.
        // So, we do not prompt the user for his consent, and we hard code the consent to all result here.
        consent: {
          rejectedScopes: [],
          rejectedClaims: [],
        },
      };

      req.session.interactionId = null;

      await provider.interactionFinished(req, res, result);
    } catch (error) {
      if (error instanceof SessionNotFound) {
        // we may have took to long to provide a session to the user since he has been redirected
        // we fail silently
        return res.redirect('https://api.gouv.fr');
      }

      next(error);
    }
  });

  app.get('/users/sign-in', csrfProtection, async (req, res, next) => {
    const notifications = errorMessages[req.query.notification]
      ? [errorMessages[req.query.notification]]
      : [];

    return res.render('sign-in', {
      notifications,
      csrfToken: req.csrfToken(),
    });
  });

  app.post(
    '/users/sign-in',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
      try {
        req.session.user = await login(req.body.login, req.body.password);

        if (req.session.interactionId) {
          return res.redirect(
            `/interaction/${req.session.interactionId}/login`
          );
        }

        return res.redirect('https://api.gouv.fr');
      } catch (error) {
        if (error.message === 'invalid_credentials') {
          return res.redirect(`/users/sign-in?notification=${error.message}`);
        }

        next(error);
      }
    }
  );

  app.get('/users/sign-up', csrfProtection, async (req, res, next) => {
    const notifications = errorMessages[req.query.notification]
      ? [errorMessages[req.query.notification]]
      : [];

    return res.render('sign-up', {
      notifications,
      csrfToken: req.csrfToken(),
      loginHint: req.query.login_hint,
    });
  });

  app.post(
    '/users/sign-up',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
      try {
        req.session.user = await signup(req.body.login, req.body.password);

        if (req.session.interactionId) {
          return res.redirect(
            `/interaction/${req.session.interactionId}/login`
          );
        }

        return res.redirect('https://api.gouv.fr');
      } catch (error) {
        if (error.message === 'username_unavailable') {
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
    }
  );

  app.get('/users/reset-password', csrfProtection, async (req, res, next) => {
    const notifications = errorMessages[req.query.notification]
      ? [errorMessages[req.query.notification]]
      : [];

    return res.render('reset-password', {
      notifications,
      csrfToken: req.csrfToken(),
    });
  });

  app.post(
    '/users/reset-password',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
      try {
        const login = req.body.login;

        await sendResetPasswordEmail(login);

        return res.redirect(
          `/users/sign-in?notification=reset_password_email_sent`
        );
      } catch (error) {
        next(error);
      }
    }
  );

  app.get('/users/change-password', csrfProtection, async (req, res, next) => {
    const resetPasswordToken = req.query.reset_password_token;

    const notifications = errorMessages[req.query.notification]
      ? [errorMessages[req.query.notification]]
      : [];

    return res.render('change-password', {
      resetPasswordToken,
      notifications,
      csrfToken: req.csrfToken(),
    });
  });

  app.post(
    '/users/change-password',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
      try {
        const resetPasswordToken = req.body.reset_password_token;

        if (req.body.password !== req.body.password_confirmation) {
          return res.redirect(
            `/users/change-password?reset_password_token=${resetPasswordToken}&notification=passwords_do_not_match`
          );
        }

        await changePassword(resetPasswordToken, req.body.password);

        return res.redirect(
          `/users/sign-in?notification=password_change_success`
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
    }
  );

  app.use((err, req, res, next) => {
    console.error(err);

    return res.render('error', {
      error_code: err.statusCode || err,
      error_message: err.message,
    });
  });
};
