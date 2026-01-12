export interface Sale {
  id: string;
  transactionDate: Date;
  totalAmount: number; // Total omzet (Gross Sales)
  totalProfit: number; // Calculated backend (Snapshot)
  items: SaleItem[];
  createdByUserId: string;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productNameSnapshot: string; // Product name at transaction time
  quantity: number;
  costPriceSnapshot: number; // Cost price at transaction time
  sellPriceSnapshot: number; // Sell price at transaction time
}

export interface CreateSaleInput {
  items: CreateSaleItemInput[];
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}
