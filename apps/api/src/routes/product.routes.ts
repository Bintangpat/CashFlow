import { Router, type Router as RouterType } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware.js';

const router: RouterType = Router();

// All product routes require authentication
router.use(authMiddleware);

// List products (all authenticated users)
router.get('/', productController.list);

// Get single product
router.get('/:id', productController.getById);

// Create product (Owner only)
router.post('/', roleMiddleware('OWNER'), productController.create);

// Update product (Owner only)
router.put('/:id', roleMiddleware('OWNER'), productController.update);

// Delete product (Owner only)
router.delete('/:id', roleMiddleware('OWNER'), productController.delete);

export default router;
