import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsService = {
  async getDashboardData() {
    const [todaySales, productCount, dailySales, topProducts] = await Promise.all([
      analyticsRepository.getTodaySales(),
      analyticsRepository.getProductCount(),
      analyticsRepository.getDailySales(7),
      analyticsRepository.getTopProducts(5),
    ]);

    return {
      today: todaySales,
      products: productCount,
      chart: dailySales,
      topProducts,
    };
  },

  async getSalesReport(startDate: Date, endDate: Date) {
    const [summary, dailySales] = await Promise.all([
      analyticsRepository.getSalesSummary(startDate, endDate),
      analyticsRepository.getDailySales(
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      ),
    ]);

    return {
      summary,
      daily: dailySales,
    };
  },

  async getProfitLossReport(startDate: Date, endDate: Date) {
    return analyticsRepository.getProfitLossReport(startDate, endDate);
  },
};
