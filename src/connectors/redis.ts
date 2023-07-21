import RedisClient, { RedisOptions } from 'ioredis';
import { REDIS_URL } from '../env';

export const getNewRedisClient = (params: RedisOptions = {}) => {
  const redisClient = new RedisClient(REDIS_URL, params);
  redisClient.on('connect', () =>
    console.log(`Connected to database : ${REDIS_URL}`)
  );

  return redisClient;
};
