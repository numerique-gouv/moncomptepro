import { RateLimiterRedis } from 'rate-limiter-flexible';
import createError from 'http-errors';
import { getNewRedisClient } from '../connectors/redis';
import { NextFunction, Request, Response } from 'express';

const doNotRateLimit = process.env.DO_NOT_RATE_LIMIT === 'True';

const redisClient = getNewRedisClient({
  enableOfflineQueue: false,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // 10 requests
  duration: 60, // per 60 second by IP
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!doNotRateLimit) {
      await rateLimiter.consume(req.ip);
    }
    next();
  } catch (e) {
    next(new createError.TooManyRequests());
  }
};
