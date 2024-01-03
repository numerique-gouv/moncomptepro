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
import { checkUserHasAtLeastOneOrganizationMiddleware } from "../middlewares/user";
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
    checkUserHasAtLeastOneOrganizationMiddleware,
    getHomeController,
  );

  mainRouter.get(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/reset-password",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getResetPasswordController,
  );

  mainRouter.get(
    "/passkeys",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getPasskeysController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    postVerifyRegistrationController,
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
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
