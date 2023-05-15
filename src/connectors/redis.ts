import RedisClient from 'ioredis';

const {
  REDIS_URL: connectionString = 'redis://:@127.0.0.1:6379',
} = process.env;

export const getNewRedisClient = (params = {}) => {
  const redisClient = new RedisClient(connectionString, params);
  redisClient.on('connect', () =>
    console.log(`Connected to database : ${connectionString}`)
  );

  return redisClient;
};
