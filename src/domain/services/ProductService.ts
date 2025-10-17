// src/domain/services/ProductService.ts
import type { IProductRepository, CreateProductData } from '../interfaces/IProductRepository';
import type { Product } from '@prisma/client';

export class ProductService {
  constructor(private productRepository: IProductRepository) { }

  async getProducts(catalogId: string): Promise<Product[]> {
    return this.productRepository.findAllByCatalogId(catalogId);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    // Validações de negócio podem ser adicionadas aqui.
    if (!data.name || data.name.length < 3) {
      throw new Error("O nome do produto deve ter pelo menos 3 caracteres.");
    }
    return this.productRepository.create(data);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Produto não encontrado.");
    }
    await this.productRepository.delete(id);
  }
}