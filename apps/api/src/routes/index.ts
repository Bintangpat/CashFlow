import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import financeRoutes from './finance.routes.js';
import salesRoutes from './sales.routes.js';
import analyticsRoutes from './analytics.routes.js';
import stockReceivingRoutes from './stock-receiving.routes.js';

const router: RouterType = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/finance', financeRoutes);
router.use('/sales', salesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/stock-receiving', stockReceivingRoutes);

export default router;
