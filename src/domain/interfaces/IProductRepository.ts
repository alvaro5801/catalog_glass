// src/domain/interfaces/IProductRepository.ts
import type { Product, Specification, PriceTier, Prisma } from '@prisma/client';

/** Tipo que inclui o Produto e as suas relações (como nos testes) */
export type ProductWithRelations = Product & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

/**
 * Tipo para os dados de criação.
 * Usamos o tipo 'Prisma.ProductCreateInput' gerado automaticamente
 * para garantir que todos os campos (incluindo relações) são compatíveis.
 */
export type CreateProductData = Prisma.ProductCreateInput;

// Este é o "contrato" que o seu ProductService.test.ts espera
export interface IProductRepository {
  findAllByCatalogId(catalogId: string): Promise<ProductWithRelations[]>;
  findById(id: string): Promise<ProductWithRelations | null>;
  create(data: CreateProductData): Promise<ProductWithRelations>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations>;
  delete(id: string): Promise<void>;
}