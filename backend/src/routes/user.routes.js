import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Password update endpoint for logged in user
router.patch('/me/password', authenticateToken, AuthController.changePassword);

export default router;
