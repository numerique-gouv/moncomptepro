import csrf from 'csurf';
import { Router, urlencoded } from 'express';
import {
  getJoinOrganizationController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from '../controllers/organization';
import {
  loginRateLimiterMiddleware,
  rateLimiterMiddleware,
} from '../middlewares/rate-limiter';
import {
  checkEmailInSessionMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
} from '../middlewares/user';
import {
  getSignInController,
  getSignUpController,
  getStartSignInController,
  postSignInMiddleware,
  postSignUpController,
  postStartSignInController,
} from '../controllers/user/signin-signup';
import {
  getVerifyEmailController,
  postSendEmailVerificationController,
  postVerifyEmailController,
} from '../controllers/user/verify-email';
import {
  getMagicLinkSentController,
  getSignInWithMagicLinkController,
  postSendMagicLinkController,
  postSignInWithMagicLinkController,
} from '../controllers/user/magic-link';
import {
  getChangePasswordController,
  getResetPasswordController,
  postChangePasswordController,
  postResetPasswordController,
} from '../controllers/user/update-password';
import {
  getPersonalInformationsController,
  postPersonalInformationsController,
} from '../controllers/user/update-personal-informations';
import { getWelcomeController } from '../controllers/user/welcome';
import { issueSessionOrRedirectController } from '../controllers/user/issue-session-or-redirect';

export const userRouter = () => {
  const userRouter = Router();
  const csrfProtectionMiddleware = csrf();

  userRouter.use((req, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  userRouter.use(urlencoded({ extended: false }));

  userRouter.get(
    '/start-sign-in',
    csrfProtectionMiddleware,
    getStartSignInController
  );
  userRouter.post(
    '/start-sign-in',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postStartSignInController
  );

  userRouter.get(
    '/sign-in',
    csrfProtectionMiddleware,
    checkEmailInSessionMiddleware,
    getSignInController
  );
  userRouter.post(
    '/sign-in',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    loginRateLimiterMiddleware,
    postSignInMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  userRouter.get(
    '/sign-up',
    csrfProtectionMiddleware,
    checkEmailInSessionMiddleware,
    getSignUpController
  );
  userRouter.post(
    '/sign-up',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    postSignUpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  userRouter.get(
    '/verify-email',
    csrfProtectionMiddleware,
    checkUserIsConnectedMiddleware,
    getVerifyEmailController
  );
  userRouter.post(
    '/verify-email',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  userRouter.post(
    '/send-email-verification',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    postSendEmailVerificationController
  );
  userRouter.post(
    '/send-magic-link',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    postSendMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  userRouter.get('/magic-link-sent', getMagicLinkSentController);
  userRouter.get(
    '/sign-in-with-magic-link',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    getSignInWithMagicLinkController
  );
  userRouter.post(
    '/sign-in-with-magic-link',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postSignInWithMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );
  userRouter.get(
    '/reset-password',
    csrfProtectionMiddleware,
    getResetPasswordController
  );
  userRouter.post(
    '/reset-password',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postResetPasswordController
  );
  userRouter.get(
    '/change-password',
    csrfProtectionMiddleware,
    getChangePasswordController
  );
  userRouter.post(
    '/change-password',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    postChangePasswordController
  );

  userRouter.get(
    '/personal-information',
    csrfProtectionMiddleware,
    checkUserIsVerifiedMiddleware,
    getPersonalInformationsController
  );
  userRouter.post(
    '/personal-information',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserIsVerifiedMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  userRouter.get(
    '/organization-suggestions',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    getOrganizationSuggestionsController
  );

  userRouter.get(
    '/join-organization',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    getJoinOrganizationController
  );
  userRouter.post(
    '/join-organization',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  userRouter.get(
    '/unable-to-auto-join-organization',
    getUnableToAutoJoinOrganizationController
  );

  userRouter.get(
    '/welcome',
    csrfProtectionMiddleware,
    checkUserSignInRequirementsMiddleware,
    getWelcomeController
  );
  userRouter.post(
    '/welcome',
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController
  );

  userRouter.post(
    '/quit-organization/:id',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    postQuitUserOrganizationController
  );

  return userRouter;
};

export default userRouter;
