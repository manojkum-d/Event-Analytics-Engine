import { Router } from 'express';
import authRoutes from './auth/index';
import apiKeyRoutes from './apiKey/index';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/api-key', apiKeyRoutes);

export default router;
