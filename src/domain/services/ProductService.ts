// src/domain/services/ProductService.ts
import type { IProductRepository, CreateProductData, ProductWithRelations } from '@/domain/interfaces/IProductRepository';
import type { Prisma } from '@prisma/client';

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  /**
   * Busca todos os produtos (passthrough).
   */
  async getProducts(catalogId: string): Promise<ProductWithRelations[]> {
    return this.productRepository.findAllByCatalogId(catalogId);
  }

  /**
   * Busca um produto por ID (passthrough).
   */
  async getProductById(id: string): Promise<ProductWithRelations | null> {
    return this.productRepository.findById(id);
  }

  /**
   * Cria um novo produto, aplicando regras de negócio.
   */
  async createProduct(data: CreateProductData): Promise<ProductWithRelations> {
    // Regra 1: Validar o nome (como no teste)
    if (!data.name || data.name.trim().length < 3) {
      throw new Error("O nome do produto deve ter pelo menos 3 caracteres.");
    }
    
    // (Poderíamos adicionar mais validações aqui, como verificar se o 'slug' é único)

    // Se passar, criar
    return this.productRepository.create(data);
  }

  /**
   * Atualiza um produto (passthrough).
   */
  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations> {
    // (Poderíamos adicionar validações aqui, como no 'createProduct')
    return this.productRepository.update(id, data);
  }

  /**
   * Apaga um produto, aplicando regras de negócio.
   */
  async deleteProduct(id: string): Promise<void> {
    // Regra 1: Verificar se o produto existe (como no teste)
    const productExists = await this.productRepository.findById(id);
    if (!productExists) {
      throw new Error("Produto não encontrado.");
    }

    // Se passar, apagar
    await this.productRepository.delete(id);
  }
}