import { RateLimiterRedis } from 'rate-limiter-flexible';
import createError from 'http-errors';

import { getNewRedisClient } from '../connectors/redis';

const redisClient = getNewRedisClient({
  enableOfflineQueue: false,
});

const rateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'middleware',
  points: 5, // 5 requests
  duration: 60, // per 60 second by IP
});

export const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (e) {
    next(new createError.TooManyRequests());
  }
};
