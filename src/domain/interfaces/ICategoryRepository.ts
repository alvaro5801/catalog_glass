// src/domain/interfaces/ICategoryRepository.ts
import type { Category } from '@prisma/client';

export interface ICategoryRepository {
  findAllByCatalogId(catalogId: string): Promise<Category[]>;
  create(name: string, catalogId: string): Promise<Category>;

  // ✅ NOVOS MÉTODOS ADICIONADOS AO CONTRATO
  findByNameAndCatalogId(name: string, catalogId: string): Promise<Category | null>;
  update(id: string, newName: string): Promise<Category>;
  delete(id: string): Promise<void>;
}