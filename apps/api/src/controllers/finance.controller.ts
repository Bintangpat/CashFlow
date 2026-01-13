import { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service.js';
import { createFinanceSchema, financeQuerySchema } from '../validators/finance.validator.js';

export const financeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = financeQuerySchema.parse(req.query);
      const result = await financeService.list(query);

      res.json({
        success: true,
        data: result.transactions,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createFinanceSchema.parse(req.body);
      const transaction = await financeService.create(input);

      res.status(201).json({
        success: true,
        data: transaction,
        message: `${input.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat`,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const summary = await financeService.getSummary(
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await financeService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
