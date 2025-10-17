// src/domain/interfaces/IProductRepository.ts
import type { Product } from '@prisma/client';

// Usaremos um tipo mais completo para a criação, incluindo as relações
export type CreateProductData = Omit<Product, 'id' | 'specifications' | 'priceTable'> & {
  specifications: { create: { material: string; capacidade: string; dimensoes: string; } };
  priceTable: { create: { quantity: string; price: number; }[] };
};

export interface IProductRepository {
  findAllByCatalogId(catalogId: string): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}