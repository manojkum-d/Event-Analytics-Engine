import express from 'express';
import { collectEvent } from '../controllers/analytics';
import {
  validateAnalyticsEvent,
  validateEventSummaryRequest,
  validateUserStatsRequest,
} from '../shared/validators/analyticsValidator';
import { validateApiKey } from '../middlewares/authMiddleware';
import { isAuthenticated } from '../middlewares/authMiddleware';
import * as analyticsController from '../controllers/analytics';
import { rateLimiter } from '../middlewares/rateLimitter';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 *   schemas:
 *     AnalyticsEvent:
 *       type: object
 *       required:
 *         - event
 *         - url
 *         - timestamp
 *       properties:
 *         event:
 *           type: string
 *           description: The type of event being recorded
 *           example: login_form_cta_click
 *         url:
 *           type: string
 *           format: uri
 *           description: The URL where the event occurred
 *           example: https://example.com/page
 *         referrer:
 *           type: string
 *           format: uri
 *           description: The referring URL
 *           example: https://google.com
 *         device:
 *           type: string
 *           description: The device type
 *           example: mobile
 *         ipAddress:
 *           type: string
 *           description: IP address of the client (automatically captured if not provided)
 *           example: 192.168.1.1
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the event occurred
 *           example: 2024-02-20T12:34:56Z
 *         trackingUserId:
 *           type: string
 *           description: Unique identifier for the user being tracked
 *           example: user_123
 *         sessionId:
 *           type: string
 *           description: Unique identifier for the user session
 *           example: session_abc
 *         pageTitle:
 *           type: string
 *           description: Title of the page where the event occurred
 *           example: Home Page
 *         pageLoadTime:
 *           type: integer
 *           description: Time in milliseconds to load the page
 *           example: 1200
 *         metadata:
 *           type: object
 *           description: Additional event data
 *           example:
 *             browser: Chrome
 *             os: Android
 *             screenSize: 1080x1920
 */

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Analytics data collection endpoints
 */

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Submit analytics event
 *     tags: [Analytics]
 *     description: Records an analytics event from a website or application
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyticsEvent'
 *     responses:
 *       201:
 *         description: Event recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Event recorded successfully
 *       400:
 *         description: Invalid event data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid event data
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: API key is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Invalid or expired API key
 *       403:
 *         description: IP address is not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Request from this IP address is not allowed
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: An error occurred while recording the event
 */
router.post(
  '/collect',
  validateApiKey,
  rateLimiter('collection'),
  validateAnalyticsEvent,
  collectEvent
);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get event analytics summary
 *     description: Retrieves analytics summary for a specific event type
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *         required: true
 *         description: The event type to get summary for
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the summary (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the summary (YYYY-MM-DD)
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: App ID to filter by (optional)
 *     responses:
 *       200:
 *         description: Analytics summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Analytics summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       type: string
 *                       example: page_view
 *                     count:
 *                       type: number
 *                       example: 3400
 *                     uniqueUsers:
 *                       type: number
 *                       example: 1200
 *                     deviceData:
 *                       type: object
 *                       properties:
 *                         mobile:
 *                           type: number
 *                           example: 2200
 *                         desktop:
 *                           type: number
 *                           example: 1200
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: App not found
 *       500:
 *         description: Server error
 */
router.get(
  '/event-summary',
  validateApiKey,
  rateLimiter('analytics'),
  validateEventSummaryRequest,
  analyticsController.getEventSummary
);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves statistics for a specific user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID to get statistics for
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  '/user-stats',
  isAuthenticated,
  validateUserStatsRequest,
  analyticsController.getUserStats
);

export default router;
