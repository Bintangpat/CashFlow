export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardAnalytics {
  grossSales: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  operationalExpenses: number;
  netProfit: number;
  salesCount: number;
  dailySales: DailySale[];
}

export interface DailySale {
  date: string;
  amount: number;
  profit: number;
}
