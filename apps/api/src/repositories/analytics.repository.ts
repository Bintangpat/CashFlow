import { prisma } from '../config/database.js';

export const analyticsRepository = {
  // Get today's sales summary
  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await prisma.sale.aggregate({
      where: {
        transactionDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
      _count: true,
    });

    return {
      totalSales: Number(result._sum.totalAmount || 0),
      totalProfit: Number(result._sum.totalProfit || 0),
      transactionCount: result._count,
    };
  },

  // Get sales summary for a date range
  async getSalesSummary(startDate: Date, endDate: Date) {
    const result = await prisma.sale.aggregate({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
      _count: true,
    });

    return {
      totalSales: Number(result._sum.totalAmount || 0),
      totalProfit: Number(result._sum.totalProfit || 0),
      transactionCount: result._count,
    };
  },

  // Get daily sales for chart
  async getDailySales(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        transactionDate: {
          gte: startDate,
        },
      },
      select: {
        transactionDate: true,
        totalAmount: true,
        totalProfit: true,
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    // Group by date
    const dailyMap = new Map<string, { sales: number; profit: number; count: number }>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { sales: 0, profit: 0, count: 0 });
    }

    // Aggregate sales
    for (const sale of sales) {
      const dateStr = sale.transactionDate.toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr) || { sales: 0, profit: 0, count: 0 };
      dailyMap.set(dateStr, {
        sales: existing.sales + Number(sale.totalAmount),
        profit: existing.profit + Number(sale.totalProfit),
        count: existing.count + 1,
      });
    }

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      profit: data.profit,
      count: data.count,
    }));
  },

  // Get top selling products
  async getTopProducts(limit: number = 5) {
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId', 'productNameSnapshot'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    return topProducts.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      totalSold: item._sum.quantity || 0,
    }));
  },

  // Get product count
  async getProductCount() {
    const [total, active, lowStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    ]);

    return { total, active, lowStock };
  },

  // Get finance summary (income vs expense)
  async getFinanceSummary(startDate?: Date, endDate?: Date) {
    const where: { transactionDate?: { gte?: Date; lte?: Date } } = {};
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    const [income, expense] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);

    return {
      totalIncome,
      totalExpense,
      netCashFlow: totalIncome - totalExpense,
    };
  },

  // Get profit and loss report
  async getProfitLossReport(startDate: Date, endDate: Date) {
    // Sales profit (dari penjualan)
    const salesResult = await prisma.sale.aggregate({
      where: {
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
    });

    // Manual income/expense
    const [income, expense] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: {
          type: 'INCOME',
          transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(salesResult._sum.totalAmount || 0);
    const grossProfit = Number(salesResult._sum.totalProfit || 0);
    const otherIncome = Number(income._sum.amount || 0);
    const expenses = Number(expense._sum.amount || 0);
    const netProfit = grossProfit + otherIncome - expenses;

    return {
      totalRevenue,
      grossProfit,
      otherIncome,
      expenses,
      netProfit,
    };
  },
};
