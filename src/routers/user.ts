import { Router, urlencoded } from "express";
import {
  getJoinOrganizationConfirmController,
  getJoinOrganizationController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postCancelModerationAndRedirectControllerFactory,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from "../controllers/organization";
import {
  authenticatorRateLimiterMiddleware,
  passwordRateLimiterMiddleware,
  rateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import {
  checkCredentialPromptRequirementsMiddleware,
  checkEmailInSessionMiddleware,
  checkIsUser,
  checkUserCanAccessAppMiddleware,
  checkUserHasAtLeastOneOrganizationMiddleware,
  checkUserHasLoggedInRecentlyMiddleware,
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserHasSelectedAnOrganizationMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
  checkUserTwoFactorAuthMiddleware,
} from "../middlewares/user";
import {
  getInclusionconnectWelcomeController,
  getSignInController,
  getSignUpController,
  getStartSignInController,
  postInclusionconnectWelcomeController,
  postSignInMiddleware,
  postSignUpController,
  postStartSignInController,
} from "../controllers/user/signin-signup";
import {
  getVerifyEmailController,
  postSendEmailVerificationController,
  postVerifyEmailController,
} from "../controllers/user/verify-email";
import {
  getMagicLinkSentController,
  getSignInWithMagicLinkController,
  postSendMagicLinkController,
  postSignInWithMagicLinkController,
} from "../controllers/user/magic-link";
import {
  getChangePasswordController,
  getResetPasswordController,
  postChangePasswordController,
  postResetPasswordController,
} from "../controllers/user/update-password";
import {
  getPersonalInformationsController,
  postPersonalInformationsController,
} from "../controllers/user/update-personal-informations";
import { getWelcomeController } from "../controllers/user/welcome";
import { issueSessionOrRedirectController } from "../controllers/user/issue-session-or-redirect";
import {
  getChooseSponsorController,
  getNoSponsorFoundController,
  getSponsorValidationController,
  postChooseSponsorMiddleware,
  postNoSponsorFoundMiddleware,
} from "../controllers/user/choose-sponsor";
import {
  getOfficialContactEmailVerificationController,
  postOfficialContactEmailVerificationMiddleware,
} from "../controllers/user/official-contact-email-verification";
import {
  getSelectOrganizationController,
  postSelectOrganizationMiddleware,
} from "../controllers/user/select-organization";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import nocache from "nocache";
import {
  getSignInWithPasskeyController,
  postVerifyAuthenticationController,
} from "../controllers/webauthn";
import { postDeleteUserController } from "../controllers/user/delete";
import {
  getMfaSignInController,
  postSignInWithAuthenticatorController,
} from "../controllers/totp";

export const userRouter = () => {
  const userRouter = Router();

  userRouter.use(nocache());

  userRouter.use(urlencoded({ extended: false }));

  userRouter.get(
    "/start-sign-in",
    checkIsUser,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    rateLimiterMiddleware,
    checkIsUser,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/inclusionconnect-welcome",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    passwordRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postSignInMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    postSignUpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/mfa-sign-in",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    getMfaSignInController,
  );
  userRouter.post(
    "/mfa-sign-in-with-authenticator",
    authenticatorRateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postSignInWithAuthenticatorController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/mfa-sign-in-with-passkey",
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postVerifyAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
  );
  userRouter.post(
    "/verify-email",
    rateLimiterMiddleware,
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/send-email-verification",
    rateLimiterMiddleware,
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
  );
  userRouter.post(
    "/send-magic-link",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    postSendMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get("/magic-link-sent", getMagicLinkSentController);
  userRouter.get(
    "/sign-in-with-magic-link",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    getSignInWithMagicLinkController,
  );
  userRouter.post(
    "/sign-in-with-magic-link",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postSignInWithMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignInWithPasskeyController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    postVerifyAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/reset-password",
    csrfProtectionMiddleware,
    getResetPasswordController,
  );
  userRouter.post(
    "/reset-password",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postResetPasswordController,
  );
  userRouter.get(
    "/change-password",
    csrfProtectionMiddleware,
    getChangePasswordController,
  );
  userRouter.post(
    "/change-password",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postChangePasswordController,
  );

  userRouter.get(
    "/personal-information",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    rateLimiterMiddleware,
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/organization-suggestions",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.get(
    "/select-organization",
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/choose-sponsor/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    getChooseSponsorController,
  );

  userRouter.post(
    "/choose-sponsor/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    postChooseSponsorMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get("/sponsor-validation", getSponsorValidationController);

  userRouter.get(
    "/no-sponsor-found/:organization_id",
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    getNoSponsorFoundController,
  );

  userRouter.post(
    "/no-sponsor-found/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    postNoSponsorFoundMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome/:organization_id",
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.post(
    "/welcome",
    rateLimiterMiddleware,
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    rateLimiterMiddleware,
    checkUserHasLoggedInRecentlyMiddleware,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  return userRouter;
};

export default userRouter;
