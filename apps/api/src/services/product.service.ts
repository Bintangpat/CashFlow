import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../validators/product.validator.js';

// Helper to convert BigInt to Number for JSON serialization
function serializeProduct(product: {
  id: string;
  name: string;
  sku: string | null;
  costPrice: bigint;
  sellPrice: bigint;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...product,
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
  };
}

export const productService = {
  async list(query: ProductQueryInput) {
    const isActive = query.active === 'true' ? true : 
                     query.active === 'false' ? false : undefined;

    const result = await productRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive,
    });

    return {
      products: result.products.map(serializeProduct),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }
    return serializeProduct(product);
  },

  async create(input: CreateProductInput) {
    // Validate: costPrice should be <= sellPrice (warning only, still allow)
    if (input.costPrice > input.sellPrice) {
      console.warn(`Warning: Cost price (${input.costPrice}) is higher than sell price (${input.sellPrice})`);
    }

    const product = await productRepository.create({
      name: input.name,
      sku: input.sku,
      costPrice: input.costPrice,
      sellPrice: input.sellPrice,
      stock: input.stock,
    });

    return serializeProduct(product);
  },

  async update(id: string, input: UpdateProductInput) {
    // Check if product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Produk tidak ditemukan', 404);
    }

    const product = await productRepository.update(id, {
      name: input.name,
      sku: input.sku,
      costPrice: input.costPrice,
      sellPrice: input.sellPrice,
      stock: input.stock,
      isActive: input.isActive,
    });

    return serializeProduct(product);
  },

  async delete(id: string) {
    // Check if product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Produk tidak ditemukan', 404);
    }

    await productRepository.softDelete(id);
    return { message: 'Produk berhasil dihapus' };
  },
};
