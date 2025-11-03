// src/domain/interfaces/ICategoryRepository.ts
import type { Category } from '@prisma/client';

// Este é o "contrato" que o seu CategoryService.test.ts espera
export interface ICategoryRepository {
  /** Encontra todas as categorias de um catálogo específico */
  findAllByCatalogId(catalogId: string): Promise<Category[]>;

  /** Encontra uma categoria pelo nome e ID do catálogo */
  findByNameAndCatalogId(name: string, catalogId: string): Promise<Category | null>;

  /** Cria uma nova categoria */
  create(name: string, catalogId: string): Promise<Category>;

  /** Atualiza o nome de uma categoria existente */
  update(id: string, newName: string): Promise<Category>;

  /** Apaga uma categoria pelo seu ID */
  delete(id: string): Promise<void>;
}