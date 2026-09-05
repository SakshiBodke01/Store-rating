import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import storeRoutes from './store.routes.js';
import ownerRoutes from './owner.routes.js';

const apiRouter = Router();

// Mount API v1 sub-routers
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/owner', ownerRoutes);

export default apiRouter;
