import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
// router.use('/products', productRoutes);
// router.use('/sales', salesRoutes);
// router.use('/finance', financeRoutes);
// router.use('/analytics', analyticsRoutes);

export default router;
