import { csrfSync } from 'csrf-sync';
import { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';

const { generateToken, invalidCsrfTokenError, isRequestValid, revokeToken } =
  csrfSync({
    getTokenFromRequest: (req: Request) => {
      return req.body['_csrf'];
    },
  });

export const csrfProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];
  const ignoredMethodsSet = new Set(ignoredMethods);
  if (ignoredMethodsSet.has(req.method)) {
    return next();
  }

  const isCsrfValid = isRequestValid(req);
  // Csrf token cannot be re-used
  revokeToken(req);
  if (!isCsrfValid) {
    const err = invalidCsrfTokenError;
    Sentry.captureException(err);
    return next(err);
  }

  next();
};

// Csrf tokens are new for each requests
export const csrfToken = (req: Request) => generateToken(req, true);
