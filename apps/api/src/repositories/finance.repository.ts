import { prisma } from '../config/database.js';
import { TransactionType } from '@prisma/client';

export const financeRepository = {
  async findMany(options: {
    page: number;
    limit: number;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page, limit, type, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: {
      type?: TransactionType;
      transactionDate?: { gte?: Date; lte?: Date };
    } = {};

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
      }),
      prisma.cashTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create(data: {
    type: TransactionType;
    category: string;
    amount: number;
    notes?: string;
    transactionDate: Date;
  }) {
    return prisma.cashTransaction.create({
      data: {
        type: data.type,
        category: data.category,
        amount: BigInt(data.amount),
        notes: data.notes,
        transactionDate: data.transactionDate,
      },
    });
  },

  async getSummary(startDate?: Date, endDate?: Date) {
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
      balance: totalIncome - totalExpense,
    };
  },

  async delete(id: string) {
    return prisma.cashTransaction.delete({
      where: { id },
    });
  },

  async findById(id: string) {
    return prisma.cashTransaction.findUnique({
      where: { id },
    });
  },
};
