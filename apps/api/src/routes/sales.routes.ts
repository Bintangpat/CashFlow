import { Router, type Router as RouterType } from 'express';
import { salesController } from '../controllers/sales.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// All sales routes require authentication
router.use(authMiddleware);

// List sales
router.get('/', salesController.list);

// Get sales summary
router.get('/summary', salesController.getSummary);

// Get single sale
router.get('/:id', salesController.getById);

// Create sale (POS transaction)
router.post('/', salesController.create);

export default router;
