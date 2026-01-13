import { salesRepository } from '../repositories/sales.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { CreateSaleInput, SaleQueryInput } from '../validators/sales.validator.js';

// Helper to serialize BigInt
function serializeSale(sale: {
  id: string;
  transactionDate: Date;
  totalAmount: bigint;
  totalProfit: bigint;
  createdByUserId: string;
  createdAt: Date;
  items: Array<{
    id: string;
    saleId: string;
    productId: string;
    productNameSnapshot: string;
    quantity: number;
    costPriceSnapshot: bigint;
    sellPriceSnapshot: bigint;
  }>;
  user?: { id: string; email: string };
}) {
  return {
    ...sale,
    totalAmount: Number(sale.totalAmount),
    totalProfit: Number(sale.totalProfit),
    items: sale.items.map((item) => ({
      ...item,
      costPriceSnapshot: Number(item.costPriceSnapshot),
      sellPriceSnapshot: Number(item.sellPriceSnapshot),
      subtotal: Number(item.sellPriceSnapshot) * item.quantity,
      profit: (Number(item.sellPriceSnapshot) - Number(item.costPriceSnapshot)) * item.quantity,
    })),
  };
}

export const salesService = {
  async list(query: SaleQueryInput) {
    const result = await salesRepository.findMany({
      page: query.page,
      limit: query.limit,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      sales: result.sales.map(serializeSale),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  },

  async getById(id: string) {
    const sale = await salesRepository.findById(id);
    if (!sale) {
      throw new AppError('Transaksi tidak ditemukan', 404);
    }
    return serializeSale(sale);
  },

  async create(input: CreateSaleInput, userId: string) {
    // Get all products for the items
    const productIds = input.items.map((item) => item.productId);
    const products = await productRepository.findByIds(productIds);

    // Validate all products exist and are active
    const productMap = new Map(products.map((p) => [p.id, p]));
    
    const saleItems: Array<{
      productId: string;
      productNameSnapshot: string;
      quantity: number;
      costPriceSnapshot: bigint;
      sellPriceSnapshot: bigint;
    }> = [];
    
    let totalAmount = BigInt(0);
    let totalProfit = BigInt(0);

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      
      if (!product) {
        throw new AppError(`Produk dengan ID ${item.productId} tidak ditemukan`, 404);
      }

      if (!product.isActive) {
        throw new AppError(`Produk "${product.name}" tidak aktif`, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Stok "${product.name}" tidak cukup (tersedia: ${product.stock}, diminta: ${item.quantity})`,
          400
        );
      }

      // Calculate amounts using current prices (SNAPSHOT)
      const subtotal = product.sellPrice * BigInt(item.quantity);
      const profit = (product.sellPrice - product.costPrice) * BigInt(item.quantity);

      totalAmount += subtotal;
      totalProfit += profit;

      saleItems.push({
        productId: product.id,
        productNameSnapshot: product.name,
        quantity: item.quantity,
        costPriceSnapshot: product.costPrice,
        sellPriceSnapshot: product.sellPrice,
      });
    }

    // Create sale with items and update stock (in transaction)
    const sale = await salesRepository.create({
      totalAmount,
      totalProfit,
      createdByUserId: userId,
      items: saleItems,
    });

    return serializeSale(sale);
  },

  async getSummary(startDate?: Date, endDate?: Date) {
    return salesRepository.getSummary(startDate, endDate);
  },
};
