// src/domain/services/CategoryService.ts
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) { }

  async getAllCategories(catalogId: string): Promise<Category[]> {
    return this.categoryRepository.findAllByCatalogId(catalogId);
  }

  async addNewCategory(name: string, catalogId: string): Promise<Category> {
    if (!name || name.trim().length < 2) {
      throw new Error("O nome da categoria deve ter pelo menos 2 caracteres.");
    }

    // Lógica de Negócio: Verificar se a categoria já existe para este catálogo
    const existingCategory = await this.categoryRepository.findByNameAndCatalogId(name, catalogId);
    if (existingCategory) {
      throw new Error("Esta categoria já existe.");
    }

    return this.categoryRepository.create(name, catalogId);
  }

  // ✅ NOVOS MÉTODOS DE SERVIÇO
  async updateCategory(originalName: string, newName: string, catalogId: string): Promise<Category> {
    if (!newName || newName.trim().length < 2) {
      throw new Error("O novo nome da categoria deve ter pelo menos 2 caracteres.");
    }

    const categoryToUpdate = await this.categoryRepository.findByNameAndCatalogId(originalName, catalogId);
    if (!categoryToUpdate) {
      throw new Error("Categoria não encontrada para ser atualizada.");
    }

    return this.categoryRepository.update(categoryToUpdate.id, newName);
  }

  async deleteCategory(name: string, catalogId: string): Promise<void> {
    const categoryToDelete = await this.categoryRepository.findByNameAndCatalogId(name, catalogId);
    if (!categoryToDelete) {
      throw new Error("Categoria não encontrada para ser apagada.");
    }

    // TODO: No futuro, adicionar regra de negócio para não apagar categorias com produtos associados.

    await this.categoryRepository.delete(categoryToDelete.id);
  }
}