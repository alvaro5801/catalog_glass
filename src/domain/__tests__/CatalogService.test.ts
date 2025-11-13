// src/domain/__tests__/CatalogService.test.ts
import { CatalogService } from "../services/CatalogService";
import { CatalogRepository } from "../repositories/CatalogRepository";

// 1. Mock do Repositório
// Criamos uma versão falsa que não toca na base de dados
const mockCatalogRepository = {
  findBySlug: jest.fn(),
  checkSlugExists: jest.fn(),
} as unknown as CatalogRepository;

describe("CatalogService", () => {
  let service: CatalogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CatalogService(mockCatalogRepository);
  });

  it("deve retornar o catálogo quando o slug existe", async () => {
    // Preparação
    const mockCatalog = { 
      id: "cat_123", 
      slug: "minha-loja", 
      userId: "user_1", 
      products: [], 
      categories: [] 
    };
    (mockCatalogRepository.findBySlug as jest.Mock).mockResolvedValue(mockCatalog);

    // Execução
    const result = await service.getCatalogBySlug("minha-loja");

    // Verificação
    expect(result).toEqual(mockCatalog);
    expect(mockCatalogRepository.findBySlug).toHaveBeenCalledWith("minha-loja");
  });

  it("deve retornar null quando o slug não existe", async () => {
    // Preparação
    (mockCatalogRepository.findBySlug as jest.Mock).mockResolvedValue(null);

    // Execução
    const result = await service.getCatalogBySlug("loja-fantasma");

    // Verificação
    expect(result).toBeNull();
  });
});