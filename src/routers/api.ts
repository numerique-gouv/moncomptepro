import { NextFunction, Request, Response, Router } from 'express';
import {
  getOrganizationInfoController,
  postForceJoinOrganizationController,
} from '../controllers/api';
import { rateLimiterMiddleware } from '../services/rate-limiter';
import { HttpError } from 'http-errors';
import expressBasicAuth from 'express-basic-auth';

const {
  API_AUTH_USERNAME = 'admin',
  API_AUTH_PASSWORD = 'admin',
} = process.env;

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.get('/organization-info', getOrganizationInfoController);

  const apiAdminRouter = Router();

  apiAdminRouter.use(
    rateLimiterMiddleware,
    expressBasicAuth({
      users: { [API_AUTH_USERNAME]: API_AUTH_PASSWORD },
    })
  );

  apiAdminRouter.post(
    '/join-organization',
    postForceJoinOrganizationController
  );

  apiRouter.use('/admin', apiAdminRouter);

  apiRouter.use(
    async (err: HttpError, req: Request, res: Response, next: NextFunction) => {
      console.error(err);

      const statusCode = err.statusCode || 500;

      return res
        .status(statusCode)
        .json({ message: err.message || err.statusMessage });
    }
  );

  return apiRouter;
};

export default apiRouter;
