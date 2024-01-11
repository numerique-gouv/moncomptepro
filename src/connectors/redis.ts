import RedisClient, { RedisOptions } from "ioredis";
import { REDIS_URL } from "../config/env";
import { logger } from "../services/log";

export const getNewRedisClient = (params: RedisOptions = {}) => {
  const redisClient = new RedisClient(REDIS_URL, params);
  redisClient.on("connect", () =>
    logger.debug(`Connected to database : ${REDIS_URL}`),
  );

  return redisClient;
};
