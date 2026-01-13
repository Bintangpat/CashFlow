'use client';

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface StockReceiving {
  id: string;
  productId: string;
  quantity: number;
  costPerItem: number;
  totalCost: number;
  notes: string | null;
  receivedAt: string;
  product: { id: string; name: string; sku: string | null };
}

interface CreateStockReceivingInput {
  productId: string;
  quantity: number;
  costPerItem: number;
  notes?: string;
}

interface StockReceivingListResponse {
  success: boolean;
  data: StockReceiving[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useStockReceivings(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['stock-receivings', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      const response = await api.get<StockReceivingListResponse>(
        `/stock-receiving?${params.toString()}`
      );
      return response;
    },
  });
}

export function useCreateStockReceiving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStockReceivingInput) =>
      api.post<{ success: boolean; data: StockReceiving }>('/stock-receiving', input),
    onSuccess: () => {
      // Invalidate stock receivings list
      queryClient.invalidateQueries({ queryKey: ['stock-receivings'] });
      // Invalidate products (stock changed)
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Invalidate finance (expense added)
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
