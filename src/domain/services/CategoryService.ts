// src/domain/services/CategoryService.ts
import type { ICategoryRepository } from '@/domain/interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

export class CategoryService {
  // O serviço "depende" de um repositório (Injeção de Dependência)
  constructor(private categoryRepository: ICategoryRepository) {}

  /**
   * Busca todas as categorias.
   * (Lógica simples, apenas repassa para o repositório)
   */
  async getAllCategories(catalogId: string): Promise<Category[]> {
    return this.categoryRepository.findAllByCatalogId(catalogId);
  }

  /**
   * Adiciona uma nova categoria, aplicando regras de negócio.
   */
  async addNewCategory(name: string, catalogId: string): Promise<Category> {
    // Regra 1: Validar o nome (como no teste)
    if (!name || name.trim().length < 2) {
      throw new Error("O nome da categoria deve ter pelo menos 2 caracteres.");
    }

    // Regra 2: Verificar se a categoria já existe (como no teste)
    const existingCategory = await this.categoryRepository.findByNameAndCatalogId(name, catalogId);
    if (existingCategory) {
      throw new Error("Esta categoria já existe.");
    }

    // Se passar, criar
    return this.categoryRepository.create(name, catalogId);
  }

  /**
   * Atualiza uma categoria, aplicando regras de negócio.
   */
  async updateCategory(oldName: string, newName: string, catalogId: string): Promise<Category> {
    // Regra 1: Validar o novo nome (como no teste)
     if (!newName || newName.trim().length < 2) {
      throw new Error("O novo nome da categoria deve ter pelo menos 2 caracteres.");
    }

    // Regra 2: Encontrar a categoria original (como no teste)
    const categoryToUpdate = await this.categoryRepository.findByNameAndCatalogId(oldName, catalogId);
    if (!categoryToUpdate) {
      throw new Error("Categoria não encontrada para ser atualizada.");
    }

    // Se passar, atualizar
    return this.categoryRepository.update(categoryToUpdate.id, newName);
  }

  /**
   * Apaga uma categoria, aplicando regras de negócio.
   */
  async deleteCategory(name: string, catalogId: string): Promise<void> {
    // Regra 1: Encontrar a categoria (como no teste)
    const categoryToDelete = await this.categoryRepository.findByNameAndCatalogId(name, catalogId);
    if (!categoryToDelete) {
      throw new Error("Categoria não encontrada para ser apagada.");
    }

    // ✅ Comentário útil da branch 'main'
    // TODO: No futuro, adicionar regra de negócio para não apagar categorias com produtos associados.

    // Se passar, apagar
    await this.categoryRepository.delete(categoryToDelete.id);
  }
}