'use client';

import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CashTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
}

interface FinanceResponse {
  success: boolean;
  data: CashTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface CreateFinanceInput {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  notes?: string;
  transactionDate: Date;
}

export function useFinance(options?: { 
  page?: number; 
  limit?: number; 
  type?: 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['finance', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', options.page.toString());
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.type) params.set('type', options.type);
      if (options?.startDate) params.set('startDate', options.startDate);
      if (options?.endDate) params.set('endDate', options.endDate);
      
      const response = await api.get<FinanceResponse>(`/finance?${params.toString()}`);
      return response;
    },
  });
}

export function useFinanceSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['finance', 'summary', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      
      const response = await api.get<{ success: boolean; data: FinanceSummary }>(
        `/finance/summary?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateFinance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateFinanceInput) => 
      api.post('/finance', {
        ...input,
        transactionDate: input.transactionDate.toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteFinance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/finance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
