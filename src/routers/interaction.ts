import { Router, urlencoded } from 'express';
import {
  interactionEndControllerFactory,
  interactionStartControllerFactory,
} from '../controllers/interaction';
import { checkUserSignInRequirementsMiddleware } from '../controllers/user';

export const interactionRouter = (oidcProvider: any) => {
  const interactionRouter = Router();

  interactionRouter.use((req, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  interactionRouter.use(urlencoded({ extended: false }));

  interactionRouter.get(
    '/:grant',
    interactionStartControllerFactory(oidcProvider)
  );
  interactionRouter.get(
    '/:grant/login',
    checkUserSignInRequirementsMiddleware,
    interactionEndControllerFactory(oidcProvider)
  );

  return interactionRouter;
};

export default interactionRouter;
