// src/domain/repositories/ProductRepository.ts
import { prisma } from '@/lib/prisma';
import type { IProductRepository, CreateProductData, ProductWithRelations } from '../interfaces/IProductRepository';
import type { Prisma } from '@prisma/client';

export class ProductRepository implements IProductRepository {
  
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
    return prisma.product.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations> {
    return prisma.product.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string): Promise<void> {
    // Apagar em transação para garantir que as relações (specs, price) são apagadas primeiro
    // (Isto assume que o 'schema.prisma' está configurado com 'onDelete: Cascade')
    // Se não estiver, teríamos de apagar 'specifications' e 'priceTable' manualmente aqui.
    await prisma.product.delete({
      where: { id },
    });
  }
}