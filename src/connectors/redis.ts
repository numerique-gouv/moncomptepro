import {
  default as Redis,
  default as RedisClient,
  type RedisOptions,
} from "ioredis";
import { REDIS_URL } from "../config/env";
import { logger } from "../services/log";

const redisClients = new WeakMap<RedisOptions, Redis>();
const defaultRedisOptions: RedisOptions = {};

export const getNewRedisClient = (
  options: RedisOptions = defaultRedisOptions,
) => {
  const clientKey = JSON.stringify(options);
  if (redisClients.has(options)) {
    return redisClients.get(options)!;
  }

  const redisClient = new RedisClient(REDIS_URL, options);
  redisClient.on("connect", () =>
    logger.debug(
      `Connected to database : ${REDIS_URL} with options: ${clientKey}`,
    ),
  );
  redisClients.set(options, redisClient);

  return redisClient;
};
