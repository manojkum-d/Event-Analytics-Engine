import { check, query } from 'express-validator';
import { validateResult } from './resultValidator';

export const validateAnalyticsEvent = [
  check('event')
    .notEmpty()
    .withMessage('Event name is required')
    .isString()
    .withMessage('Event name must be a string')
    .trim(),

  check('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('URL must be valid')
    .isLength({ max: 2048 })
    .withMessage('URL must not exceed 2048 characters'),

  check('referrer')
    .optional()
    .isURL()
    .withMessage('Referrer must be a valid URL')
    .isLength({ max: 2048 })
    .withMessage('Referrer must not exceed 2048 characters'),

  check('device').optional().isString().withMessage('Device must be a string'),

  check('ipAddress').optional().isIP().withMessage('IP address must be valid'),

  check('timestamp')
    .notEmpty()
    .withMessage('Timestamp is required')
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),

  check('trackingUserId').optional().isString().withMessage('Tracking user ID must be a string'),

  check('sessionId').optional().isString().withMessage('Session ID must be a string'),

  check('pageTitle').optional().isString().withMessage('Page title must be a string'),

  check('pageLoadTime').optional().isInt().withMessage('Page load time must be an integer'),

  check('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
    .custom((value) => {
      if (value.browser && typeof value.browser !== 'string') {
        throw new Error('Browser must be a string');
      }
      if (value.os && typeof value.os !== 'string') {
        throw new Error('OS must be a string');
      }
      if (value.screenSize && typeof value.screenSize !== 'string') {
        throw new Error('Screen size must be a string');
      }
      return true;
    }),

  validateResult,
];

export const validateApiKeyHeader = [
  check('x-api-key')
    .exists()
    .withMessage('API key is required in X-API-Key header')
    .isString()
    .withMessage('API key must be a string'),

  validateResult,
];

export const validateEventSummaryRequest = [
  query('event').notEmpty().withMessage('Event type is required'),
  query('startDate').optional().isDate().withMessage('Invalid start date format'),
  query('endDate').optional().isDate().withMessage('Invalid end date format'),
  query('app_id').optional().isUUID().withMessage('Invalid app ID format'),
];

export const validateUserStatsRequest = [
  query('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
];
