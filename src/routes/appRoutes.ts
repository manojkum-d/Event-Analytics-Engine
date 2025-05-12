import express from 'express';
import { registerApp, getAppApiKey, revokeAppApiKey } from '../controllers/app';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

// App registration (also creates API key)
router.post('/register', isAuthenticated, registerApp);

// API Key operations by app
router.get('/:appId/api-key', isAuthenticated, getAppApiKey);
router.post('/:appId/revoke-key', isAuthenticated, revokeAppApiKey);

export default router;
