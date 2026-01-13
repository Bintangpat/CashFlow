import { z } from 'zod';

export const createFinanceSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Kategori harus diisi'),
  amount: z.number().int().min(1, 'Jumlah minimal 1'),
  notes: z.string().optional(),
  transactionDate: z.coerce.date(),
});

export const financeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateFinanceInput = z.infer<typeof createFinanceSchema>;
export type FinanceQueryInput = z.infer<typeof financeQuerySchema>;
