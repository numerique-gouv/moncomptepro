import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { DO_NOT_RATE_LIMIT } from "../config/env";
import { getNewRedisClient } from "../connectors/redis";

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
    if (!DO_NOT_RATE_LIMIT) {
      if (!req.session.email) {
        // fail silently
        const err = new Error(
          "Email not defined in loginRateLimiterMiddleware. Ensure checkEmailInSessionMiddleware was used before this middleware.",
        );
        Sentry.captureException(err);
        return next();
      }

      await loginRateLimiter.consume(req.session.email);
    }
    next();
  } catch (e) {
    next(new HttpErrors.TooManyRequests());
  }
};
