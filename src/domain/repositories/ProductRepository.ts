// src/domain/repositories/ProductRepository.ts
import { prisma } from '@/lib/prisma';
import type { IProductRepository, CreateProductData } from '../interfaces/IProductRepository';
import type { Product } from '@prisma/client';

export class ProductRepository implements IProductRepository {
  async findAllByCatalogId(catalogId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { catalogId },
      include: {
        specifications: true,
        priceTable: true,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        specifications: true,
        priceTable: true,
      },
    });
  }

  async create(data: CreateProductData): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
      },
      include: {
        specifications: true,
        priceTable: true,
      },
    });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        specifications: true,
        priceTable: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Para apagar um produto, precisamos apagar as suas relações primeiro
    await prisma.$transaction([
      prisma.specification.deleteMany({ where: { productId: id } }),
      prisma.priceTier.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
  }
}