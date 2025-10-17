// src/domain/repositories/CategoryRepository.ts
import { prisma } from '@/lib/prisma';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

export class CategoryRepository implements ICategoryRepository {
  async findAllByCatalogId(catalogId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { catalogId },
    });
  }

  async create(name: string, catalogId: string): Promise<Category> {
    return await prisma.category.create({
      data: {
        name,
        catalogId,
      },
    });
  }

  // ✅ IMPLEMENTAÇÃO DOS NOVOS MÉTODOS
  async findByNameAndCatalogId(name: string, catalogId: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: {
        name_catalogId: {
          name,
          catalogId,
        },
      },
    });
  }

  async update(id: string, newName: string): Promise<Category> {
    return await prisma.category.update({
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