import { Express, Router, urlencoded } from "express";
import {
  getHelpController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  getResetPasswordController,
  postPersonalInformationsController,
} from "../controllers/main";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";
import { checkUserCanAccessAppMiddleware } from "../middlewares/user";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import nocache from "nocache";
import {
  deletePasskeyController,
  getPasskeysController,
  postVerifyRegistrationController,
} from "../controllers/webauthn";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.use(nocache());

  mainRouter.get(
    "/",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserCanAccessAppMiddleware,
    getHomeController,
  );

  mainRouter.get(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserCanAccessAppMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserCanAccessAppMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/reset-password",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserCanAccessAppMiddleware,
    getResetPasswordController,
  );

  mainRouter.get(
    "/passkeys",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserCanAccessAppMiddleware,
    getPasskeysController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    postVerifyRegistrationController,
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    deletePasskeyController,
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
