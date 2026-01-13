import { Response, NextFunction } from 'express';
import { salesService } from '../services/sales.service.js';
import { createSaleSchema, saleQuerySchema } from '../validators/sales.validator.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const salesController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = saleQuerySchema.parse(req.query);
      const result = await salesService.list(query);

      res.json({
        success: true,
        data: result.sales,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sale = await salesService.getById(id);

      res.json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const input = createSaleSchema.parse(req.body);
      const sale = await salesService.create(input, req.user.userId);

      res.status(201).json({
        success: true,
        data: sale,
        message: 'Transaksi berhasil',
      });
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const summary = await salesService.getSummary(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },
};
