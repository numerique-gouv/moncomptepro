import csrf from 'csurf';
import { Router } from 'express';
import { getHelpController, getHomeController } from '../controllers/main';
import { ejsLayoutMiddlewareFactory } from '../services/renderer';

export const mainRouter = app => {
  const csrfProtectionMiddleware = csrf();
  const mainRouter = Router();

  mainRouter.get('/', ejsLayoutMiddlewareFactory(app), getHomeController);

  mainRouter.get(
    '/help',
    ejsLayoutMiddlewareFactory(app),
    csrfProtectionMiddleware,
    getHelpController
  );

  return mainRouter;
};

export default mainRouter;
