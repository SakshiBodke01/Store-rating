import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint returning system status and uptime metrics
 * @access  Public
 */
router.get('/health', HealthController.getHealth);

export default router;
