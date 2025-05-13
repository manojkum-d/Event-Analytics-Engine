import express from 'express';
import { collectEvent, getEventSummary, getUserStats } from '../controllers/analytics';
import { validateAnalyticsEvent } from '../shared/validators/analyticsValidator';
import { validateApiKey } from '../middlewares/authMiddleware';
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
 *     EventData:
 *       type: object
 *       required:
 *         - event
 *         - url
 *       properties:
 *         event:
 *           type: string
 *           example: page_view
 *           description: Event type to track
 *         url:
 *           type: string
 *           format: uri
 *           example: https://example.com/products
 *           description: URL where the event occurred
 *         referrer:
 *           type: string
 *           format: uri
 *           example: https://google.com
 *           description: Referring URL (optional)
 *         device:
 *           type: string
 *           enum: [mobile, desktop, tablet]
 *           example: desktop
 *           description: Device type
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2024-02-25T10:30:45Z
 *           description: When the event occurred (ISO format)
 *         pageTitle:
 *           type: string
 *           example: Product Catalog | Example Store
 *           description: Title of the page
 *         pageLoadTime:
 *           type: integer
 *           example: 1200
 *           description: Page load time in milliseconds
 *         trackingUserId:
 *           type: string
 *           example: user_123456
 *           description: Unique identifier for the user in your system
 *         sessionId:
 *           type: string
 *           example: sess_789xyz
 *           description: Session identifier
 *         metadata:
 *           type: object
 *           description: Additional data about the event
 *           properties:
 *             browser:
 *               type: string
 *               example: Chrome
 *             browserVersion:
 *               type: string
 *               example: 121.0.0
 *             os:
 *               type: string
 *               example: Windows
 *             osVersion:
 *               type: string
 *               example: 11
 *             screenSize:
 *               type: string
 *               example: 1920x1080
 *             language:
 *               type: string
 *               example: en-US
 *             timezone:
 *               type: string
 *               example: UTC-5
 *     EventSummary:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           example: page_view
 *         count:
 *           type: integer
 *           example: 3400
 *         uniqueUsers:
 *           type: integer
 *           example: 1200
 *         deviceData:
 *           type: object
 *           properties:
 *             mobile:
 *               type: integer
 *               example: 2200
 *             desktop:
 *               type: integer
 *               example: 1200
 *     UserStats:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: user_123456
 *         totalEvents:
 *           type: integer
 *           example: 150
 *         deviceDetails:
 *           type: object
 *           properties:
 *             browser:
 *               type: string
 *               example: Chrome
 *             os:
 *               type: string
 *               example: Android
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.1
 */

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Analytics data collection and retrieval endpoints
 */

/**
 * @swagger
 * /api/v1/analytics/collect:
 *   post:
 *     summary: Submit analytics event
 *     tags: [Analytics]
 *     description: Submits analytics events from a website or mobile app
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventData'
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/EventData'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid API key
 *       429:
 *         description: Rate limit exceeded
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *             description: Maximum number of requests allowed in the window
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *             description: Number of requests left in the current window
 *           X-RateLimit-Reset:
 *             schema:
 *               type: integer
 *             description: Time when the rate limit resets (Unix timestamp)
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
 * /api/v1/analytics/event-summary:
 *   get:
 *     summary: Get event analytics summary
 *     tags: [Analytics]
 *     description: Retrieves analytics summary for a specific event type
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         example: page_view
 *         description: Event type to get summary for
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2024-02-15
 *         description: Optional filter for start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2024-02-20
 *         description: Optional filter for end date (YYYY-MM-DD)
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 5a425bde-e170-433f-9b42-15a7bf0a2b59
 *         description: Optional filter for application ID (if not provided, fetches data across all apps)
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Analytics summary retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/EventSummary'
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Invalid API key
 *       404:
 *         description: App not found
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/event-summary', validateApiKey, rateLimiter('analytics'), getEventSummary);

/**
 * @swagger
 * /api/v1/analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     description: Returns stats based on unique users with event counts and device details
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: user_123456
 *         description: Tracking user ID to get stats for
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *       400:
 *         description: Missing userId parameter
 *       401:
 *         description: Invalid API key
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/user-stats', validateApiKey, rateLimiter('analytics'), getUserStats);

export default router;
