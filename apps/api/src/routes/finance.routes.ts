import { Router, type Router as RouterType } from 'express';
import { financeController } from '../controllers/finance.controller.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// All finance routes require authentication
router.use(authMiddleware);

// List transactions
router.get('/', financeController.list);

// Get summary (balance)
router.get('/summary', financeController.getSummary);

// Create transaction (Owner only)
router.post('/', roleMiddleware('OWNER'), financeController.create);

// Delete transaction (Owner only)
router.delete('/:id', roleMiddleware('OWNER'), financeController.delete);

export default router;
