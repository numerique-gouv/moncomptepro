import csrf from 'csurf';
import { urlencoded } from 'express';
import {
  interactionEndControllerFactory,
  interactionStartControllerFactory,
} from './controllers/interaction';
import { getHelpController, getHomeController } from './controllers/main';
import {
  getJoinOrganizationController,
  postJoinOrganizationMiddleware,
} from './controllers/organisation';
import {
  checkEmailInSessionMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
  getChangePasswordController,
  getMagicLinkSentController,
  getPersonalInformationsController,
  getResetPasswordController,
  getSignInController,
  getSignInWithMagicLinkController,
  getSignUpController,
  getStartSignInController,
  getVerifyEmailController,
  issueSessionOrRedirectController,
  postChangePasswordController,
  postPersonalInformationsController,
  postResetPasswordController,
  postSendEmailVerificationController,
  postSendMagicLinkController,
  postSignInMiddleware,
  postSignUpController,
  postStartSignInController,
  postVerifyEmailController,
} from './controllers/user';
import { rateLimiterMiddleware } from './services/rate-limiter';
import {
  ejsLayoutMiddlewareFactory,
  renderWithEjsLayout,
} from './services/renderer';

module.exports = (app, provider) => {
  const csrfProtectionMiddleware = csrf();

  app.get('/', ejsLayoutMiddlewareFactory(app), getHomeController);

  app.get(
    '/help',
    ejsLayoutMiddlewareFactory(app),
    csrfProtectionMiddleware,
    getHelpController
  );

  // wrap template within layout except for welcome.ejs page
  const routeWithTemplateRegex = /^\/users\/.+$/;
  app.use(routeWithTemplateRegex, ejsLayoutMiddlewareFactory(app));

  app.use(/^\/(users|interaction)/, (req, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  app.use(/^\/(users|interaction)/, urlencoded({ extended: false }));

  app.get('/interaction/:grant', interactionStartControllerFactory(provider));
  app.get(
    '/interaction/:grant/login',
    checkUserSignInRequirementsMiddleware,
    interactionEndControllerFactory(provider)
  );

  app.get(
    '/users/start-sign-in',
    csrfProtectionMiddleware,
    getStartSignInController
  );
  app.post(
    '/users/start-sign-in',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postStartSignInController
  );

  app.get(
    '/users/sign-in',
    csrfProtectionMiddleware,
    checkEmailInSessionMiddleware,
    getSignInController
  );
  app.post(
    '/users/sign-in',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    postSignInMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  app.get(
    '/users/sign-up',
    csrfProtectionMiddleware,
    checkEmailInSessionMiddleware,
    getSignUpController
  );
  app.post(
    '/users/sign-up',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    postSignUpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  app.get(
    '/users/verify-email',
    csrfProtectionMiddleware,
    checkUserIsConnectedMiddleware,
    getVerifyEmailController
  );
  app.post(
    '/users/verify-email',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  app.post(
    '/users/send-email-verification',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    postSendEmailVerificationController
  );
  app.post(
    '/users/send-magic-link',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    postSendMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  app.get('/users/magic-link-sent', getMagicLinkSentController);
  app.get(
    '/users/sign-in-with-magic-link',
    rateLimiterMiddleware,
    getSignInWithMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  app.get(
    '/users/reset-password',
    csrfProtectionMiddleware,
    getResetPasswordController
  );
  app.post(
    '/users/reset-password',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postResetPasswordController
  );
  app.get(
    '/users/change-password',
    csrfProtectionMiddleware,
    getChangePasswordController
  );
  app.post(
    '/users/change-password',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postChangePasswordController
  );

  app.get(
    '/users/personal-information',
    csrfProtectionMiddleware,
    checkUserIsVerifiedMiddleware,
    getPersonalInformationsController
  );
  app.post(
    '/users/personal-information',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsVerifiedMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  app.get(
    '/users/join-organization',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    getJoinOrganizationController
  );
  app.post(
    '/users/join-organization',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
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
