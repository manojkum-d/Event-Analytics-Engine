import express from 'express';
import {
  googleAuth,
  googleCallback,
  authSuccess,
  getCurrentUser,
  logout,
} from '../controllers/auth';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { getAppApiKey, registerApp, revokeAppApiKey } from '../controllers/app';
import passport from 'passport';
import { getApiKeys } from '../controllers/apiKey';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         profileImage:
 *           type: string
 *           format: uri
 *     ApiKey:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         key:
 *           type: string
 *         appId:
 *           type: string
 *           format: uuid
 *         isActive:
 *           type: boolean
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         ipRestrictions:
 *           type: array
 *           items:
 *             type: string
 *             format: ipv4
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: API Key Management
 *     description: API key and application management endpoints
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     description: Redirects to Google OAuth login page
 *     responses:
 *       302:
 *         description: Redirects to Google login
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Authentication]
 *     description: Processes the Google OAuth callback
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirects to success page or login page
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
    successRedirect: '/api/v1/auth/success',
  })
);

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: Authentication success endpoint
 *     tags: [Authentication]
 *     description: Returns user details after successful authentication
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                   example: Authentication successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
router.get('/success', authSuccess);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     description: Returns details of the currently authenticated user
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', isAuthenticated, getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logs out the current user
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 */
router.get('/logout', logout);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new application and generate API key
 *     tags: [API Key Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appName
 *             properties:
 *               appName:
 *                 type: string
 *                 example: My Website
 *               description:
 *                 type: string
 *                 example: Analytics for my personal website
 *               appUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://mywebsite.com
 *               ipRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ipv4
 *                 example: ["192.168.1.1"]
 *     responses:
 *       201:
 *         description: Application registered and API key generated successfully
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
 *                   example: API key generated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/register', isAuthenticated, registerApp);

/**
 * @swagger
 * /auth/api-keys:
 *   get:
 *     summary: Get all API keys for current user
 *     tags: [API Key Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKey'
 *       401:
 *         description: Unauthorized
 */
router.use('/api-keys', isAuthenticated, getApiKeys);

/**
 * @swagger
 * /auth/{appId}/api-key:
 *   get:
 *     summary: Get API key for specific application
 *     tags: [API Key Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:appId/api-key', isAuthenticated, getAppApiKey);

/**
 * @swagger
 * /auth/{appId}/revoke-key:
 *   post:
 *     summary: Revoke API key for specific application
 *     tags: [API Key Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
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
 *                   example: API key revoked successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:appId/revoke-key', isAuthenticated, revokeAppApiKey);

export default router;
