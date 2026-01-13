'use client';

import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  today: {
    totalSales: number;
    totalProfit: number;
    transactionCount: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  chart: Array<{
    date: string;
    sales: number;
    profit: number;
    count: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
  }>;
}

interface ProfitLossData {
  totalRevenue: number;
  grossProfit: number;
  otherIncome: number;
  expenses: number;
  netProfit: number;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DashboardData }>('/analytics/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useProfitLoss(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'profit-loss', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      
      const response = await api.get<{ success: boolean; data: ProfitLossData }>(
        `/analytics/profit-loss?${params.toString()}`
      );
      return response.data;
    },
  });
}
