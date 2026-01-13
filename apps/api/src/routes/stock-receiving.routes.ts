import { Router, type Router as RouterType } from 'express';
import { stockReceivingController } from '../controllers/stock-receiving.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// All routes require authentication
router.use(authMiddleware);

// List stock receivings
router.get('/', stockReceivingController.list);

// Create stock receiving (Owner only)
router.post('/', requireRole('OWNER'), stockReceivingController.create);

export default router;
