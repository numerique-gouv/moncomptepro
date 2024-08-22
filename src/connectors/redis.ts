import {
  default as Redis,
  default as RedisClient,
  RedisOptions,
} from "ioredis";
import { REDIS_URL } from "../config/env";
import { logger } from "../services/log";

const redisClients: { [key: string]: Redis } = {};

export const getNewRedisClient = (options: RedisOptions = {}) => {
  const clientKey = JSON.stringify(options);
  if (!redisClients[clientKey]) {
    const redisClient = new RedisClient(REDIS_URL, options);
    redisClient.on("connect", () =>
      logger.debug(
        `Connected to database : ${REDIS_URL} with options: ${clientKey}`,
      ),
    );
    redisClients[clientKey] = redisClient;
  }

  return redisClients[clientKey];
};
