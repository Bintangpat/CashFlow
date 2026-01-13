import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardData();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      const data = await analyticsService.getSalesReport(start, end);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfitLoss(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      // Default to current month
      const now = new Date();
      const start = startDate 
        ? new Date(startDate as string) 
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endDate 
        ? new Date(endDate as string) 
        : new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const data = await analyticsService.getProfitLossReport(start, end);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
