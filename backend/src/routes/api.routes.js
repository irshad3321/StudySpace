import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller.js';

const router = Router();

// GET /api/health - Health check endpoint
router.get('/health', getHealthStatus);

export default router;
