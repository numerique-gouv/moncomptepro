import { Express, Router, urlencoded } from "express";
import {
  getConnectionAndAccountController,
  getHelpController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  postDisableForce2faController,
  postEnableForce2faController,
  postPersonalInformationsController,
} from "../controllers/main";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";
import {
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
} from "../middlewares/user";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import nocache from "nocache";
import {
  deletePasskeyController,
  postVerifyRegistrationController,
} from "../controllers/webauthn";
import {
  getAuthenticatorConfigurationController,
  postAuthenticatorConfigurationController,
  postDeleteAuthenticatorConfigurationController,
} from "../controllers/totp";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.use(nocache());

  mainRouter.get(
    "/connection-and-account",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.get(
    "/authenticator-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getAuthenticatorConfigurationController,
  );

  mainRouter.post(
    "/authenticator-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postAuthenticatorConfigurationController,
  );

  mainRouter.post(
    "/delete-authenticator-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteAuthenticatorConfigurationController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postVerifyRegistrationController,
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    deletePasskeyController,
  );

  mainRouter.post(
    "/disable-force-2fa",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDisableForce2faController,
  );

  mainRouter.post(
    "/enable-force-2fa",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postEnableForce2faController,
  );

  mainRouter.get(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAppMiddleware,
    getHomeController,
  );

  mainRouter.get(
    "/help",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    getHelpController,
  );

  return mainRouter;
};

export default mainRouter;
