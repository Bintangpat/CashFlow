import { Response, NextFunction } from 'express';
import { stockReceivingService } from '../services/stock-receiving.service.js';
import { createStockReceivingSchema, stockReceivingQuerySchema } from '../validators/stock-receiving.validator.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const stockReceivingController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = stockReceivingQuerySchema.parse(req.query);
      const result = await stockReceivingService.list(query);

      res.json({
        success: true,
        data: result.receivings,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = createStockReceivingSchema.parse(req.body);
      const receiving = await stockReceivingService.create(input);

      res.status(201).json({
        success: true,
        data: receiving,
        message: 'Barang berhasil diterima dan stok diperbarui',
      });
    } catch (error) {
      next(error);
    }
  },
};
