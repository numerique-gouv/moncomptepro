import csrf from 'csurf';
import { Router, urlencoded } from 'express';
import {
  getJoinOrganizationController,
  getManageOrganizationsController,
  getUserOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from '../controllers/organization';
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
} from '../controllers/user';
import { rateLimiterMiddleware } from '../services/rate-limiter';

export const userRouter = app => {
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
    rateLimiterMiddleware,
    getSignInWithMagicLinkController,
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
    '/manage-organizations',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    getManageOrganizationsController
  );

  userRouter.get(
    '/organization/:id',
    csrfProtectionMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    getUserOrganizationController
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
