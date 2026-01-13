import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  sku: z.string().optional(),
  costPrice: z.number().int().min(0, 'Harga modal minimal 0'),
  sellPrice: z.number().int().min(0, 'Harga jual minimal 0'),
  stock: z.number().int().min(0).optional().default(0),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  costPrice: z.number().int().min(0).optional(),
  sellPrice: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  active: z.enum(['true', 'false', 'all']).optional().default('all'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
