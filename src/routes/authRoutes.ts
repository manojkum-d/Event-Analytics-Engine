import express from 'express';
import {
  googleAuth,
  googleCallback,
  authSuccess,
  getCurrentUser,
  logout,
} from '../controllers/auth';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { registerApp } from '../controllers/app';
import passport from 'passport';

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Get Google OAuth URL
 *     tags: [Authentication]
 *     description: Returns Google OAuth URL for client-side authentication
 *     responses:
 *       200:
 *         description: Google OAuth URL
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
 *                   example: Google OAuth URL generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: https://accounts.google.com/o/oauth2/v2/auth?response_type=code&...
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
 *         description: Redirects to success page after successful authentication
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
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Authentication successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         profileImage:
 *                           type: string
 *                           example: https://example.com/profile.jpg
 */
router.get('/success', authSuccess);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     description: Returns details of the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                   example: User details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         profileImage:
 *                           type: string
 *                           example: https://example.com/profile.jpg
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
 *                   type: number
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
 *     summary: Create a new API key
 *     tags: [API Key Management]
 *     description: Creates a new API key for the authenticated user
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
 *                 example: https://mywebsite.com
 *               ipRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1"]
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: API key created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     key:
 *                       type: string
 *                       example: YWJjZGVmMTIzNDU2Nzg5MA==
 *                     appName:
 *                       type: string
 *                       example: My Website
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-12-31T23:59:59Z
 *       400:
 *         description: App name is required
 *       401:
 *         description: Not authenticated
 */
router.post('/register', isAuthenticated, registerApp);

export default router;
