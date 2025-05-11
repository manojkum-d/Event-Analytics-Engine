import dotenv from 'dotenv';
import CustomError from '../utils/customError/index.js';

dotenv.config();

/**
 * Utility function to validate environment variables.
 * Throws an error if the environment variable is missing and no default value is provided.
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new CustomError(`Environment variable ${name} is not set.`, 500);
  }
  return value;
}

/**
 * Utility function to get a numeric environment variable with validation.
 */
export function getEnvVarAsNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new CustomError(`Environment variable ${name} is not set.`, 500);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new CustomError(`Environment variable ${name} should be a number.`, 500);
  }
  return parsed;
}
