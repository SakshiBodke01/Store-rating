import { Router } from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Protect ALL store routes with authentication
router.use(authenticateToken);

// Normal User store search & listing
router.get('/', StoreController.getStores);

// Ratings endpoints
router.post('/:storeId/ratings', authorizeRoles('USER'), StoreController.submitRating);
router.patch('/:storeId/ratings', authorizeRoles('USER'), StoreController.submitRating);
router.get('/:storeId/my-rating', StoreController.getMyRating);

export default router;
