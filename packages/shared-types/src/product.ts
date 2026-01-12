export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  costPrice: number; // Stored in smallest unit (rupiah)
  sellPrice: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  costPrice: number;
  sellPrice: number;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  costPrice?: number;
  sellPrice?: number;
  stock?: number;
  isActive?: boolean;
}

// Cart Item (Frontend only helper)
export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}
