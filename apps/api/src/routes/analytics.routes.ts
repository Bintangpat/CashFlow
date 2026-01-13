import { Router, type Router as RouterType } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Dashboard data (summary)
router.get('/dashboard', analyticsController.getDashboard);

// Sales report
router.get('/sales', analyticsController.getSalesReport);

// Profit & Loss report
router.get('/profit-loss', analyticsController.getProfitLoss);

export default router;
