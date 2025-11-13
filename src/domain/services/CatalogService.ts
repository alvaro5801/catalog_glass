// src/domain/services/CatalogService.ts
import { CatalogRepository } from "../repositories/CatalogRepository";

export class CatalogService {
  private catalogRepository: CatalogRepository;

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  async getCatalogBySlug(slug: string) {
    const catalog = await this.catalogRepository.findBySlug(slug);
    
    if (!catalog) {
      return null; // Ou lançar erro, dependendo da preferência
    }

    return catalog;
  }
}