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
const _GOOGLE_CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID');
const _GOOGLE_CLIENT_SECRET = getEnvVar('GOOGLE_CLIENT_SECRET');
const _GOOGLE_CALLBACK_URL = getEnvVar('GOOGLE_CALLBACK_URL');
const _SESSION_SECRET = getEnvVar('SESSION_SECRET');
const _JWT_SECRET = getEnvVar('JWT_SECRET');
const _JWT_REFRESH_SECRET = getEnvVar('JWT_REFRESH_SECRET');
const _JWT_EXPIRES_IN = getEnvVar('JWT_EXPIRES_IN');
const _JWT_REFRESH_EXPIRES_IN = getEnvVar('JWT_REFRESH_EXPIRES_IN');

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
  get googleClientId() {
    return _GOOGLE_CLIENT_ID;
  },
  get googleClientSecret() {
    return _GOOGLE_CLIENT_SECRET;
  },
  get googleCallbackUrl() {
    return _GOOGLE_CALLBACK_URL;
  },
  get sessionSecret() {
    return _SESSION_SECRET;
  },
  get jwtSecret() {
    return _JWT_SECRET;
  },
  get jwtRefreshSecret() {
    return _JWT_REFRESH_SECRET;
  },
  get jwtExpiresIn() {
    return _JWT_EXPIRES_IN;
  },
  get jwtRefreshExpiresIn() {
    return _JWT_REFRESH_EXPIRES_IN;
  },
};
