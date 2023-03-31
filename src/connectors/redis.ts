import RedisClient from 'ioredis';

export const getNewRedisClient = (params = {}) => {
  const redisClient = new RedisClient(params);
  redisClient.on('connect', () =>
    console.log('Connected to database : redis://:@127.0.0.1:6380')
  );

  return redisClient;
};
