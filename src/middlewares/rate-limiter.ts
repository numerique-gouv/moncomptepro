import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { DO_NOT_RATE_LIMIT } from "../config/env";
import { getNewRedisClient } from "../connectors/redis";
import {
  getEmailFromLoggedOutSession,
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
} from "../managers/session";

const redisClient = getNewRedisClient({
  enableOfflineQueue: false,
});

const ipRateLimiterMiddlewareFactory =
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

const emailRateLimiterMiddlewareFactory =
  (rateLimiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (DO_NOT_RATE_LIMIT) {
      } else if (isWithinAuthenticatedSession(req.session)) {
        const { email } = getUserFromAuthenticatedSession(req);
        await rateLimiter.consume(email);
      } else if (getEmailFromLoggedOutSession(req)) {
        await rateLimiter.consume(getEmailFromLoggedOutSession(req)!);
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

const defaultRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter",
  points: 20, // 20 requests
  duration: 60, // per minute per IP
});

export const rateLimiterMiddleware =
  ipRateLimiterMiddlewareFactory(defaultRateLimiter);

const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter-api",
  points: 42, // 4 API requests
  duration: 1, // per second per IP
});

export const apiRateLimiterMiddleware =
  ipRateLimiterMiddlewareFactory(apiRateLimiter);

const passwordRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter-password",
  points: 10, // 10 requests
  duration: 5 * 60, // per 5 minutes per email
});

export const passwordRateLimiterMiddleware =
  emailRateLimiterMiddlewareFactory(passwordRateLimiter);

const authenticatorRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter-totp",
  points: 5, // 5 requests
  duration: 15 * 60, // per 15 minutes per email
});

export const authenticatorRateLimiterMiddleware =
  emailRateLimiterMiddlewareFactory(authenticatorRateLimiter);
