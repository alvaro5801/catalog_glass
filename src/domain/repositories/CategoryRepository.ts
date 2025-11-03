// src/domain/repositories/CategoryRepository.ts
import { prisma } from '@/lib/prisma';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

export class CategoryRepository implements ICategoryRepository {
  
  async findAllByCatalogId(catalogId: string): Promise<Category[]> {
    // Estilo limpo (sem await redundante)
    return prisma.category.findMany({
      where: { catalogId },
    });
  }

  // Implementação correta da branch 'main' (usando findUnique)
  async findByNameAndCatalogId(name: string, catalogId: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: {
        // Isto assume que tens '@@unique([name, catalogId])' no teu schema.prisma
        name_catalogId: {
          name,
          catalogId,
        },
      },
    });
  }

  async create(name: string, catalogId: string): Promise<Category> {
    // Estilo limpo e formatação corrigida
    return prisma.category.create({
      data: { 
        name, 
        catalogId 
      },
    });
  }

  async update(id: string, newName: string): Promise<Category> {
    // Estilo limpo (sem await redundante)
    return prisma.category.update({
      where: { id },
      data: { name: newName },
    });
  }

  async delete(id: string): Promise<void> {
    // Este método estava igual em ambos
    await prisma.category.delete({
      where: { id },
    });
  }
}