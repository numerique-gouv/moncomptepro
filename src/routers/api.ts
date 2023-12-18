import {
  json,
  NextFunction,
  Request,
  Response,
  Router,
  urlencoded,
} from 'express';
import {
  getOrganizationInfoController,
  getPingApiSireneController,
  postForceJoinOrganizationController,
  postMarkDomainAsVerified,
  postSendModerationProcessedEmail,
} from '../controllers/api';
import { apiRateLimiterMiddleware } from '../middlewares/rate-limiter';
import { HttpError } from 'http-errors';
import expressBasicAuth from 'express-basic-auth';
import { API_AUTH_PASSWORD, API_AUTH_USERNAME } from '../config/env';
import nocache from 'nocache';
import {
  getGenerateRegistrationOptionsController,
  getVerifyRegistrationController,
} from '../controllers/webauthn';

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.use(nocache());

  apiRouter.use(urlencoded({ extended: false }));

  apiRouter.get(
    '/sirene/ping',
    apiRateLimiterMiddleware,
    getPingApiSireneController
  );

  apiRouter.get(
    '/sirene/organization-info/:siret',
    apiRateLimiterMiddleware,
    getOrganizationInfoController
  );

  apiRouter.use(
    '/webauthn/generate-registration-options',
    getGenerateRegistrationOptionsController
  );

  apiRouter.use(
    '/webauthn/verify-registration',
    json({ inflate: true }),
    getVerifyRegistrationController
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
