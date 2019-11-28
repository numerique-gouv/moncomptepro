import { urlencoded } from 'express';
import { isEmpty } from 'lodash';
import csrf from 'csurf';

import {
  changePassword,
  login,
  sendEmailAddressVerificationEmail,
  sendResetPasswordEmail,
  signup,
  verifyEmail,
} from './services/user-manager';
import { rateLimiterMiddleware } from './services/rate-limiter';
import {
  ejsLayoutMiddlewareFactory,
  renderWithEjsLayout,
} from './services/utils';
import {
  joinOrganization,
  getOrganizationsByUserId,
} from './services/organization-manager';

module.exports = (app, provider) => {
  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = provider;

  const csrfProtection = csrf();

  // wrap template within layout except for welcome.ejs page
  const routeWithTemplateRegex = /^\/users\/.+$/;
  app.use(routeWithTemplateRegex, ejsLayoutMiddlewareFactory(app));

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
    invalid_email: {
      type: 'error',
      message: 'Adresse email invalide.',
    },
    invalid_siret: {
      type: 'error',
      message: 'SIRET invalide.',
    },
    invalid_token: {
      type: 'warning',
      message: 'Le lien que vous avez utilisé est invalide ou expiré.',
    },
    password_change_success: {
      type: 'success',
      message:
        'Votre mot de passe a été mis à jour. Veuillez vous connecter avec votre nouveau mot de passe.',
    },
    passwords_do_not_match: {
      type: 'error',
      message: 'Les mots de passe ne correspondent pas.',
    },
    reset_password_email_sent: {
      type: 'info',
      message: 'Vous allez recevoir un lien de réinitialisation par e-mail.',
    },
    unable_to_auto_join_organization: {
      type: 'warning',
      message: `Nous ne sommes pas en mesure de traiter votre demande automatiquement.
      Pour rejoindre cette organisation, merci de nous transmettre une demande
      écrite à l'adresse contact@api.gouv.fr.`,
    },
    user_in_organization_already: {
      type: 'error',
      message: 'Vous appartenez déjà à cette organisation.'
    },
    organization_needed: {
      type: 'warning',
      message: `Pour continuer, merci de renseigner le numéro SIRET de l'organisation que
      vous représentez.`,
    },
    signup_step2: {
      type: 'info',
      message: `Afin de compléter votre inscription, merci de renseigner le numéro SIRET de
      l'organisation que vous représentez.`,
    },
    email_unavailable: {
      type: 'warning',
      message: `Un compte existe déjà avec cet email.
      Cliquez sur "je me connecte" pour vous connecter.
      Si vous avez oublié votre mot de passe cliquez sur "je me connecte"
      puis sur "Mot de passe oublié ?".`,
    },
    email_verification_required: {
      type: 'info',
      message: `Vous devez activer votre compte avant de continuer.
      Pour cela cliquez sur le lien d'activation que vous avez reçu par mail.`,
    },
    email_verification_sent: {
      type: 'success',
      message: "Un email d'activation de votre compte vous a été envoyé.",
    },
    email_verified_already: {
      type: 'error',
      message: `Votre compte est déjà activé.`,
    },
    verify_email_success: {
      type: 'success',
      message: 'Votre compte a été activé avec succès.',
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
        uid: interactionId,
        prompt,
        params: { source },
      } = await provider.interactionDetails(req);

      req.session.interactionId = interactionId;

      if (prompt.name === 'login') {
        return res.redirect(`/users/${source ? '?source=' + source : ''}`);
      }

      if (prompt.name === 'consent') {
        // Consent to share the user's data is implicitly given.
        // If consent is required, we redirect the user to the end of the login process
        // There, his consent will be accepted by default.
        if (!isEmpty(req.session.user)) {
          return res.redirect(`/interaction/${interactionId}/login`);
        }
        return res.redirect(`/users/sign-in`);
      }

      return res.status(500).render('error', {
        error_code: 'unknown_interaction_name',
        error_message: prompt.name,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/interaction/:grant/login', async (req, res, next) => {
    try {
      if (isEmpty(req.session.user)) {
        // This may occur if the oidc session cookie duration (maxAge) is longer
        // in time than the express session one.
        return next(new Error('user not in session'));
      }

      const result = {
        login: {
          account: req.session.user.id,
          acr: 'urn:mace:incommon:iap:bronze',
          amr: ['pwd'],
          ts: Math.floor(Date.now() / 1000),
          // Set the session cookie as persistent (vs transient) to limit the session duration to
          // the duration specified in oidc provider long cookie maxAge configuration.
          // Transient cookies can result in non expiring session as mentioned in
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Session_cookies
          remember: true,
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
        return res.redirect('https://api.gouv.fr/?filter=signup');
      }

      next(error);
    }
  });

  app.get('/users/', csrfProtection, async (req, res, next) => {
    const source = req.query.source;

    return res.render('welcome', {
      csrfToken: req.csrfToken(),
      source,
    });
  });

  app.get('/users/sign-in', csrfProtection, async (req, res, next) => {
    const notifications = errorMessages[req.query.notification]
      ? [errorMessages[req.query.notification]]
      : [];

    return res.render('sign-in', {
      notifications,
      referer: req.query.referer,
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
          return res.redirect(
            `/interaction/${req.session.interactionId}/login`
          );
        }

        if (req.body.referer) {
          return res.redirect(req.body.referer);
        }

        return res.redirect('https://api.gouv.fr/?filter=signup');
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
        req.session.user = await signup(
          req.body.given_name,
          req.body.family_name,
          req.body.login,
          req.body.password
        );

        await sendEmailAddressVerificationEmail(req.session.user.email);

        return res.redirect(
          `/users/join-organization?notification=signup_step2`
        );
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
    }
  );

  app.get(
    '/users/join-organization',
    csrfProtection,
    async (req, res, next) => {
      if (isEmpty(req.session.user)) {
        // user must be logged in to access this page
        const notificationParams = req.query.notification
          ? `?notification=${req.query.notification}`
          : '';

        return res.redirect(
          `/users/sign-in${notificationParams}?referer=/users/join-organization`
        );
      }

      const notifications = errorMessages[req.query.notification]
        ? [errorMessages[req.query.notification]]
        : [];

      return res.render('join-organization', {
        notifications,
        csrfToken: req.csrfToken(),
        siretHint: req.query.siret_hint,
      });
    }
  );

  app.post(
    '/users/join-organization',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
      try {
        if (isEmpty(req.session.user)) {
          return next(
            new Error('user must be logged in to join an organization')
          );
        }

        await joinOrganization(req.body.siret, req.session.user.id);

        if (req.session.interactionId) {
          return res.redirect(
            `/interaction/${req.session.interactionId}/login`
          );
        }

        return res.redirect('https://api.gouv.fr/?filter=signup');
      } catch (error) {
        if (error.message === 'unable_to_auto_join_organization') {
          return res.redirect(
            `/users/join-organization?notification=${
              error.message
            }&siret_hint=${req.body.siret}`
          );
        }

        if (error.message === 'invalid_siret') {
          return res.redirect(
            `/users/join-organization?notification=${
              error.message
            }&siret_hint=${req.body.siret}`
          );
        }

        if (error.message === 'user_in_organization_already') {
          return res.redirect(
            `/users/join-organization?notification=${
              error.message
            }&siret_hint=${req.body.siret}`
          );
        }

        next(error);
      }
    }
  );

  app.get('/users/verify-email', csrfProtection, async (req, res, next) => {
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
  });

  app.get(
    '/users/send-email-verification',
    csrfProtection,
    async (req, res, next) => {
      if (isEmpty(req.session.user)) {
        // user must be logged in to access this page
        const notificationParams = req.query.notification
          ? `?notification=${req.query.notification}`
          : '';

        return res.redirect(
          `/users/sign-in${notificationParams}?referer=/users/send-email-verification`
        );
      }

      const notifications = errorMessages[req.query.notification]
        ? [errorMessages[req.query.notification]]
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
    }
  );

  app.post(
    '/users/send-email-verification',
    csrfProtection,
    rateLimiterMiddleware,
    async (req, res, next) => {
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

  app.use(async (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const templateName = 'error';
    const params = {
      error_code: err.statusCode || err,
      error_message: err.message,
    };

    if (req.originalUrl.match(routeWithTemplateRegex)) {
      // the layout has already been applied on this route (see above)
      return res.status(statusCode).render(templateName, params);
    }

    const html = await renderWithEjsLayout(templateName, params);

    return res.status(statusCode).send(html);
  });
};
