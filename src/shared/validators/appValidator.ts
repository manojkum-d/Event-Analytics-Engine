import { check } from 'express-validator';
import { validateResult } from './resultValidator';

// Validate app ID
export const validateAppId = [
  check('appId')
    .notEmpty()
    .withMessage('App ID is required')
    .isUUID()
    .withMessage('Invalid App ID format'),
  validateResult,
];

// Validate app creation
export const validateCreateApp = [
  check('appName')
    .notEmpty()
    .withMessage('App name is required')
    .isString()
    .withMessage('App name must be a string'),

  check('description').optional().isString().withMessage('Description must be a string'),

  check('appUrl').optional().isURL().withMessage('App URL must be a valid URL'),

  check('ipRestrictions').optional().isArray().withMessage('IP restrictions must be an array'),

  validateResult,
];
