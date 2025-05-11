import express from 'express';
import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
  regenerateApiKey,
} from '../../controllers/apiKeyController';
import { isAuthenticated } from '../../middlewares/authMiddleware';
import {
  validateCreateApiKeyBody,
  validateApiKeyId,
} from '../../shared/validators/apiKeyValidator';

const router = express.Router();

/**
 * @swagger
 * /api-keys/create:
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
router.post('/create', isAuthenticated, validateCreateApiKeyBody, createApiKey);

/**
 * @swagger
 * /api-keys:
 *   get:
 *     summary: List all API keys
 *     tags: [API Key Management]
 *     description: Retrieves all API keys for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
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
 *                   example: API keys retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKeys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           key:
 *                             type: string
 *                             example: YWJjZGVmMTIzNDU2Nzg5MA==
 *                           appName:
 *                             type: string
 *                             example: My Website
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-12-31T23:59:59Z
 *       401:
 *         description: Not authenticated
 */
router.get('/', isAuthenticated, getApiKeys);

/**
 * @swagger
 * /api-keys/{id}/revoke:
 *   post:
 *     summary: Revoke an API key
 *     tags: [API Key Management]
 *     description: Revokes an existing API key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The API key ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
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
 *                   example: API key revoked successfully
 *       400:
 *         description: Invalid API key ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: API key not found
 */
router.post('/:id/revoke', isAuthenticated, validateApiKeyId, revokeApiKey);

/**
 * @swagger
 * /api-keys/{id}/regenerate:
 *   post:
 *     summary: Regenerate an API key
 *     tags: [API Key Management]
 *     description: Regenerates an existing API key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The API key ID
 *     responses:
 *       200:
 *         description: API key regenerated successfully
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
 *                   example: API key regenerated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     key:
 *                       type: string
 *                       example: YWJjZGVmMTIzNDU2Nzg5MA==
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-12-31T23:59:59Z
 *       400:
 *         description: Invalid API key ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: API key not found
 */
router.post('/:id/regenerate', isAuthenticated, validateApiKeyId, regenerateApiKey);

export default router;
