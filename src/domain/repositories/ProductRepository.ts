// src/domain/repositories/ProductRepository.ts
import { prisma } from '@/lib/prisma';
// ✅ Tipos corretos da 'feature/test'
import type { IProductRepository, CreateProductData, ProductWithRelations } from '../interfaces/IProductRepository';
import type { Prisma } from '@prisma/client';

export class ProductRepository implements IProductRepository {
  
  // ✅ Estrutura DRY (Don't Repeat Yourself) da 'feature/test'
  private includeRelations = {
    specifications: true,
    priceTable: true,
  };

  async findAllByCatalogId(catalogId: string): Promise<ProductWithRelations[]> {
    return prisma.product.findMany({
      where: { catalogId },
      include: this.includeRelations,
    });
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: CreateProductData): Promise<ProductWithRelations> {
    // ✅ Implementação da 'feature/test' que corresponde à Interface
    return prisma.product.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations> {
    // ✅ Implementação da 'feature/test' que corresponde à Interface
    return prisma.product.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string): Promise<void> {
    // ✅ Lógica de 'delete' mais segura da 'main'
    // Para apagar um produto, precisamos apagar as suas relações primeiro
    await prisma.$transaction([
      prisma.specification.deleteMany({ where: { productId: id } }),
      prisma.priceTier.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
  }
}