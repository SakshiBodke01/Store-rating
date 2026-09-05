import { Router } from 'express';
import { OwnerController } from '../controllers/owner.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Protect Store Owner endpoints with Auth + STORE_OWNER / ADMIN Role Authorization
router.use(authenticateToken, authorizeRoles('STORE_OWNER', 'ADMIN'));

router.get('/dashboard', OwnerController.getDashboard);

export default router;
