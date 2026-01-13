'use client';

import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateSaleInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

interface SaleItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  costPriceSnapshot: number;
  sellPriceSnapshot: number;
  subtotal: number;
  profit: number;
}

interface Sale {
  id: string;
  transactionDate: string;
  totalAmount: number;
  totalProfit: number;
  items: SaleItem[];
}

interface SaleResponse {
  success: boolean;
  data: Sale;
  message?: string;
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleInput) =>
      api.post<SaleResponse>('/sales', input),
    onSuccess: () => {
      // Invalidate products to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Invalidate sales
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
