import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema 
} from '../validators/product.validator.js';

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.list(query);

      res.json({
        success: true,
        data: result.products,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createProductSchema.parse(req.body);
      const product = await productService.create(input);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Produk berhasil ditambahkan',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = updateProductSchema.parse(req.body);
      const product = await productService.update(id, input);

      res.json({
        success: true,
        data: product,
        message: 'Produk berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
