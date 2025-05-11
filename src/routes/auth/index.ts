import express from 'express';
import {
  googleAuth,
  googleCallback,
  authSuccess,
  getCurrentUser,
  logout,
  createApiKey,
  getApiKeys,
  revokeApiKey,
  regenerateApiKey,
} from '../../controllers/authController';
import { isAuthenticated } from '../../middlewares/authMiddleware';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/success', authSuccess);

// User routes (protected)
router.get('/me', isAuthenticated, getCurrentUser);
router.get('/logout', logout);

// API key management (protected)
router.post('/register', isAuthenticated, createApiKey);
router.get('/api-key', isAuthenticated, getApiKeys);
router.post('/revoke/:id', isAuthenticated, revokeApiKey);
router.post('/regenerate/:id', isAuthenticated, regenerateApiKey);

export default router;
