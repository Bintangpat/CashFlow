import { prisma } from '../config/database.js';

interface SaleItemInput {
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  costPriceSnapshot: bigint;
  sellPriceSnapshot: bigint;
}

export const salesRepository = {
  async findMany(options: {
    page: number;
    limit: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page, limit, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: { transactionDate?: { gte?: Date; lte?: Date } } = {};

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          items: true,
          user: {
            select: { id: true, email: true },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: { id: true, email: true },
        },
      },
    });
  },

  async create(data: {
    totalAmount: bigint;
    totalProfit: bigint;
    createdByUserId: string;
    items: SaleItemInput[];
  }) {
    return prisma.$transaction(async (tx) => {
      // Create sale with items
      const sale = await tx.sale.create({
        data: {
          totalAmount: data.totalAmount,
          totalProfit: data.totalProfit,
          createdByUserId: data.createdByUserId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productNameSnapshot: item.productNameSnapshot,
              quantity: item.quantity,
              costPriceSnapshot: item.costPriceSnapshot,
              sellPriceSnapshot: item.sellPriceSnapshot,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Create income transaction in finance (auto-record POS sale)
      await tx.cashTransaction.create({
        data: {
          type: 'INCOME',
          category: 'Penjualan',
          amount: data.totalAmount,
          notes: `Transaksi POS #${sale.id.slice(-8).toUpperCase()}`,
          transactionDate: new Date(),
        },
      });

      return sale;
    });
  },

  async getDailySales(startDate: Date, endDate: Date) {
    const sales = await prisma.sale.groupBy({
      by: ['transactionDate'],
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

    return sales;
  },

  async getSummary(startDate?: Date, endDate?: Date) {
    const where: { transactionDate?: { gte?: Date; lte?: Date } } = {};
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    const result = await prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
      _count: true,
    });

    return {
      totalAmount: Number(result._sum.totalAmount || 0),
      totalProfit: Number(result._sum.totalProfit || 0),
      count: result._count,
    };
  },
};
