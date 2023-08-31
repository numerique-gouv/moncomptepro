import { Router, urlencoded } from 'express';
import {
  interactionEndControllerFactory,
  interactionStartControllerFactory,
} from '../controllers/interaction';
import { checkUserSignInRequirementsMiddleware } from '../middlewares/user';
import nocache from 'nocache';

export const interactionRouter = (oidcProvider: any) => {
  const interactionRouter = Router();

  interactionRouter.use(nocache());

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
