import Redis from 'ioredis';
import { envConfig } from './envConfig';

const { redisHost, redisPort } = envConfig;

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
});

redisClient.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

export default redisClient;
