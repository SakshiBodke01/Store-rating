import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Protect ALL admin routes with Auth + ADMIN Role Authorization
router.use(authenticateToken, authorizeRoles('ADMIN'));

// Admin User Management
router.post('/users', AdminController.createUser);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);

// Admin Store Management
router.post('/stores', AdminController.createStore);
router.get('/stores', AdminController.getStores);

// Admin Dashboard Summary Stats
router.get('/dashboard', AdminController.getDashboardStats);

export default router;
