import { prisma } from '../config/database.js';

export const productRepository = {
  async findMany(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, isActive } = options;
    const skip = (page - 1) * limit;

    const where: {
      name?: { contains: string; mode: 'insensitive' };
      isActive?: boolean;
    } = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async create(data: {
    name: string;
    sku?: string;
    costPrice: bigint | number;
    sellPrice: bigint | number;
    stock?: number;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        costPrice: BigInt(data.costPrice),
        sellPrice: BigInt(data.sellPrice),
        stock: data.stock ?? 0,
      },
    });
  },

  async update(id: string, data: {
    name?: string;
    sku?: string | null;
    costPrice?: bigint | number;
    sellPrice?: bigint | number;
    stock?: number;
    isActive?: boolean;
  }) {
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.costPrice !== undefined) updateData.costPrice = BigInt(data.costPrice);
    if (data.sellPrice !== undefined) updateData.sellPrice = BigInt(data.sellPrice);
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async findByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
    });
  },
};
