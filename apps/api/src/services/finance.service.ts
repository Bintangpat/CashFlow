import { financeRepository } from '../repositories/finance.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { CreateFinanceInput, FinanceQueryInput } from '../validators/finance.validator.js';

// Helper to serialize BigInt
function serializeTransaction(transaction: {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: bigint;
  notes: string | null;
  transactionDate: Date;
  createdAt: Date;
}) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
  };
}

export const financeService = {
  async list(query: FinanceQueryInput) {
    const result = await financeRepository.findMany({
      page: query.page,
      limit: query.limit,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      transactions: result.transactions.map(serializeTransaction),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  },

  async create(input: CreateFinanceInput) {
    const transaction = await financeRepository.create({
      type: input.type,
      category: input.category,
      amount: input.amount,
      notes: input.notes,
      transactionDate: input.transactionDate,
    });

    return serializeTransaction(transaction);
  },

  async getSummary(startDate?: Date, endDate?: Date) {
    return financeRepository.getSummary(startDate, endDate);
  },

  async delete(id: string) {
    const existing = await financeRepository.findById(id);
    if (!existing) {
      throw new AppError('Transaksi tidak ditemukan', 404);
    }

    await financeRepository.delete(id);
    return { message: 'Transaksi berhasil dihapus' };
  },
};
