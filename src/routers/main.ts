import { Express, Router, urlencoded } from 'express';
import {
  getHelpController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  getResetPasswordController,
  postPersonalInformationsController,
} from '../controllers/main';
import { ejsLayoutMiddlewareFactory } from '../services/renderer';
import { checkUserHasAtLeastOneOrganizationMiddleware } from '../middlewares/user';
import { rateLimiterMiddleware } from '../middlewares/rate-limiter';
import { csrfProtectionMiddleware } from '../middlewares/csrf-protection';

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.use((req, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  mainRouter.get(
    '/',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    checkUserHasAtLeastOneOrganizationMiddleware,
    getHomeController
  );

  mainRouter.get(
    '/personal-information',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getPersonalInformationsController
  );

  mainRouter.post(
    '/personal-information',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    postPersonalInformationsController
  );

  mainRouter.get(
    '/manage-organizations',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getManageOrganizationsController
  );

  mainRouter.get(
    '/reset-password',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    getResetPasswordController
  );

  mainRouter.get(
    '/help',
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    csrfProtectionMiddleware,
    getHelpController
  );

  return mainRouter;
};

export default mainRouter;
