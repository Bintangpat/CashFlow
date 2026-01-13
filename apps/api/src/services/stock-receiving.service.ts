import { stockReceivingRepository } from '../repositories/stock-receiving.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { CreateStockReceivingInput, StockReceivingQueryInput } from '../validators/stock-receiving.validator.js';

// Helper to serialize BigInt
function serializeReceiving(receiving: {
  id: string;
  productId: string;
  quantity: number;
  costPerItem: bigint;
  totalCost: bigint;
  notes: string | null;
  receivedAt: Date;
  createdAt: Date;
  product: { id: string; name: string; sku: string | null };
}) {
  return {
    ...receiving,
    costPerItem: Number(receiving.costPerItem),
    totalCost: Number(receiving.totalCost),
  };
}

export const stockReceivingService = {
  async list(query: StockReceivingQueryInput) {
    const result = await stockReceivingRepository.findMany({
      page: query.page,
      limit: query.limit,
      productId: query.productId,
    });

    return {
      receivings: result.receivings.map(serializeReceiving),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  },

  async create(input: CreateStockReceivingInput) {
    // Validate product exists
    const product = await productRepository.findById(input.productId);
    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }

    const costPerItem = BigInt(Math.round(input.costPerItem));
    const totalCost = costPerItem * BigInt(input.quantity);

    const receiving = await stockReceivingRepository.create({
      productId: input.productId,
      quantity: input.quantity,
      costPerItem,
      totalCost,
      notes: input.notes,
    });

    return serializeReceiving(receiving);
  },
};
