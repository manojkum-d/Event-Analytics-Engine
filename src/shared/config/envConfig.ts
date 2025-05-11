import dotenv from 'dotenv';

import { getEnvVar, getEnvVarAsNumber } from '../validators/validateEnv';

dotenv.config();

// Private constants for environment variables with validation
const _NODE_ENV = getEnvVar('NODE_ENV');
const _PORT = getEnvVarAsNumber('PORT');
const _DB_HOST = getEnvVar('DB_HOST');
const _DB_PORT = getEnvVarAsNumber('DB_PORT');
const _DB_NAME = getEnvVar('DB_NAME');
const _DB_USER = getEnvVar('DB_USER');
const _REDIS_HOST = getEnvVar('REDIS_HOST');
const _REDIS_PORT = getEnvVarAsNumber('REDIS_PORT');
const _API_KEY_EXPIRATION_DAYS = getEnvVarAsNumber('API_KEY_EXPIRATION_DAYS');

export const envConfig = {
  get nodeEnv() {
    return _NODE_ENV;
  },
  get apiKeyExpirationDays() {
    return _API_KEY_EXPIRATION_DAYS;
  },
  get port() {
    return _PORT;
  },
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
