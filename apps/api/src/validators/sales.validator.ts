import { z } from 'zod';

export const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Product ID tidak valid'),
    quantity: z.number().int().min(1, 'Quantity minimal 1'),
  })).min(1, 'Minimal 1 item'),
});

export const saleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleQueryInput = z.infer<typeof saleQuerySchema>;
