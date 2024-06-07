import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { DO_NOT_RATE_LIMIT } from "../config/env";
import { getNewRedisClient } from "../connectors/redis";
import {
  getEmailFromLoggedOutSession,
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
} from "../managers/session";

const redisClient = getNewRedisClient({
  enableOfflineQueue: false,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter",
  points: 20, // 20 requests
  duration: 60, // per minute per IP
});

const rateLimiterMiddlewareFactory =
  (rateLimiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!DO_NOT_RATE_LIMIT) {
        await rateLimiter.consume(req.ip);
      }
      next();
    } catch (e) {
      next(new HttpErrors.TooManyRequests());
    }
  };

export const rateLimiterMiddleware = rateLimiterMiddlewareFactory(rateLimiter);

const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter-api",
  points: 42, // 4 API requests
  duration: 1, // per second per IP
});

export const apiRateLimiterMiddleware =
  rateLimiterMiddlewareFactory(apiRateLimiter);

const loginRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter-login",
  points: 10, // 10 requests
  duration: 5 * 60, // per 5 minutes per email
});

export const loginRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (DO_NOT_RATE_LIMIT) {
    } else if (isWithinLoggedInSession(req)) {
      const { email } = getUserFromLoggedInSession(req);
      await loginRateLimiter.consume(email);
    } else if (getEmailFromLoggedOutSession(req)) {
      await loginRateLimiter.consume(getEmailFromLoggedOutSession(req)!);
    } else {
      const err = new Error("Falling back to ip rate limiting.");
      Sentry.captureException(err);
      // Fall back to ip rate limiting to avoid security flaw
      await rateLimiter.consume(req.ip);
    }

    return next();
  } catch (e) {
    next(new HttpErrors.TooManyRequests());
  }
};
