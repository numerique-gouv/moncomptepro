import { type Express, Router, urlencoded } from "express";
import nocache from "nocache";
import {
  getConnectionAndAccountController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  postDisableForce2faController,
  postEnableForce2faController,
  postPersonalInformationsController,
} from "../controllers/main";
import {
  getAuthenticatorAppConfigurationController,
  postAuthenticatorAppConfigurationController,
  postDeleteAuthenticatorAppConfigurationController,
} from "../controllers/totp";
import {
  deletePasskeyController,
  postVerifyRegistrationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import {
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
} from "../middlewares/user";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";

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
    "/authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/delete-authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteAuthenticatorAppConfigurationController,
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

  return mainRouter;
};

export default mainRouter;
