import { NextFunction, Request, Response, Router } from 'express';
import {
  getOrganizationInfoController,
  postForceJoinOrganizationController,
  postMarkDomainAsVerified,
  postSendModerationProcessedEmail,
} from '../controllers/api';
import { apiRateLimiterMiddleware } from '../middlewares/rate-limiter';
import { HttpError } from 'http-errors';
import expressBasicAuth from 'express-basic-auth';
import { API_AUTH_PASSWORD, API_AUTH_USERNAME } from '../env';

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.get(
    '/organization-info',
    apiRateLimiterMiddleware,
    getOrganizationInfoController
  );

  const apiAdminRouter = Router();

  apiAdminRouter.use(
    apiRateLimiterMiddleware,
    expressBasicAuth({
      users: { [API_AUTH_USERNAME]: API_AUTH_PASSWORD },
    })
  );

  apiAdminRouter.post(
    '/join-organization',
    postForceJoinOrganizationController
  );

  apiAdminRouter.post(
    '/send-moderation-processed-email',
    postSendModerationProcessedEmail
  );

  apiAdminRouter.post('/mark-domain-as-verified', postMarkDomainAsVerified);

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
