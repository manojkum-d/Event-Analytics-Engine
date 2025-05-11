import dotenv from 'dotenv';

import { getEnvVar, getEnvVarAsNumber } from '../validators/validateEnv.js';

dotenv.config();

// Private constants for environment variables with validation
const _DB_HOST = getEnvVar('DB_HOST');
const _DB_PORT = getEnvVarAsNumber('DB_PORT');
const _DB_NAME = getEnvVar('DB_NAME');
const _DB_USER = getEnvVar('DB_USER');
const _REDIS_HOST = getEnvVar('REDIS_HOST');
const _REDIS_PORT = getEnvVarAsNumber('REDIS_PORT');

export const envConfig = {
  get dbHost() {
    return _DB_HOST;
  },
  get dbPort() {
    return _DB_PORT;
  },
  get dbName() {
    return _DB_NAME;
  },
  get dbUser() {
    return _DB_USER;
  },
  get redisHost() {
    return _REDIS_HOST;
  },
  get redisPort() {
    return _REDIS_PORT;
  },
};
