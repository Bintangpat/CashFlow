import { z } from 'zod';

export const createStockReceivingSchema = z.object({
  productId: z.string().uuid('Product ID tidak valid'),
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
  costPerItem: z.number().min(0, 'Harga per item tidak boleh negatif'),
  notes: z.string().optional(),
});

export const stockReceivingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  productId: z.string().uuid().optional(),
});

export type CreateStockReceivingInput = z.infer<typeof createStockReceivingSchema>;
export type StockReceivingQueryInput = z.infer<typeof stockReceivingQuerySchema>;
