import express from 'express';
import authRoutes from './authRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
