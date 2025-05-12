import express from 'express';
import authRoutes from './authRoutes';
import appRoutes from './appRoutes';
import apiKeyRoutes from './apikeyRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/api-key', apiKeyRoutes);
router.use('/app', appRoutes);

export default router;
