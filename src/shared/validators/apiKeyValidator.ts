import { check } from 'express-validator';
import { validateResult } from './resultValidator';

// Validator for creating a new API key
export const validateCreateApiKeyBody = [
  check('appName')
    .notEmpty()
    .withMessage('App name is required')
    .isString()
    .withMessage('App name must be a string'),

  check('description').optional().isString().withMessage('Description must be a string'),

  check('appUrl').optional().isURL().withMessage('App URL must be a valid URL'),

  check('ipRestrictions')
    .optional()
    .isArray()
    .withMessage('IP restrictions must be an array')
    .custom((ips) => {
      if (!Array.isArray(ips)) return true;
      // Basic IP address validation with CIDR support
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
      return ips.every((ip) => ipRegex.test(ip));
    })
    .withMessage(
      'One or more IP addresses are invalid. Use CIDR notation for IP ranges (e.g., 192.168.1.0/24)'
    ),

  validateResult,
];

// Validator for API key ID in params
export const validateApiKeyId = [
  check('id')
    .notEmpty()
    .withMessage('API key ID is required')
    .isUUID()
    .withMessage('API key ID must be a valid UUID'),

  validateResult,
];

// Validator for the request header that contains the API key
export const validateApiKeyHeader = [
  check('x-api-key')
    .exists()
    .withMessage('API key is required in x-api-key header')
    .isString()
    .withMessage('API key must be a string'),

  validateResult,
];
