import { Express, Router, urlencoded } from "express";
import {
  getConnectionAndAccountController,
  getHelpController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  postPersonalInformationsController,
} from "../controllers/main";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";
import {
  checkUserCanAccessAppMiddleware,
  checkUserHasLoggedInRecentlyMiddleware,
} from "../middlewares/user";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import nocache from "nocache";
import {
  deletePasskeyController,
  postVerifyRegistrationController,
} from "../controllers/webauthn";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.use(nocache());

  mainRouter.get(
    "/connection-and-account",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserHasLoggedInRecentlyMiddleware,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserHasLoggedInRecentlyMiddleware,
    csrfProtectionMiddleware,
    postVerifyRegistrationController,
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    rateLimiterMiddleware,
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserHasLoggedInRecentlyMiddleware,
    csrfProtectionMiddleware,
    deletePasskeyController,
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
