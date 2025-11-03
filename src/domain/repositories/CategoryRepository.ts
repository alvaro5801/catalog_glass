// src/domain/repositories/CategoryRepository.ts
import { prisma } from '@/lib/prisma';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

export class CategoryRepository implements ICategoryRepository {
  
  async findAllByCatalogId(catalogId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { catalogId },
    });
  }

  async findByNameAndCatalogId(name: string, catalogId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: { name, catalogId },
    });
  }

  async create(name: string, catalogId: string): Promise<Category> {
    return prisma.category.create({
      data: { name, catalogId },
    });
  }

  async update(id: string, newName: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { name: newName },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}