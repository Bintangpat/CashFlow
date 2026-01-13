import { prisma } from '../config/database.js';

export const stockReceivingRepository = {
  async findMany(options: {
    page: number;
    limit: number;
    productId?: string;
  }) {
    const { page, limit, productId } = options;
    const skip = (page - 1) * limit;

    const where = productId ? { productId } : {};

    const [receivings, total] = await Promise.all([
      prisma.stockReceiving.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      }),
      prisma.stockReceiving.count({ where }),
    ]);

    return {
      receivings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create(data: {
    productId: string;
    quantity: number;
    costPerItem: bigint;
    totalCost: bigint;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Create stock receiving record
      const receiving = await tx.stockReceiving.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          costPerItem: data.costPerItem,
          totalCost: data.totalCost,
          notes: data.notes,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: { increment: data.quantity },
          costPrice: data.costPerItem, // Update cost price to latest
        },
      });

      // Create expense transaction in finance
      await tx.cashTransaction.create({
        data: {
          type: 'EXPENSE',
          category: 'Pembelian Barang',
          amount: data.totalCost,
          notes: `Terima barang: ${receiving.product.name} x ${data.quantity}`,
          transactionDate: new Date(),
        },
      });

      return receiving;
    });
  },
};
