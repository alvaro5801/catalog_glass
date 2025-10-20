// src/domain/services/__tests__/CategoryService.test.ts
import { CategoryService } from '@/domain/services/CategoryService';
import type { ICategoryRepository } from '@/domain/interfaces/ICategoryRepository';
import type { Category } from '@prisma/client';

// 1. Criar um "mock" (simulação) do Repositório
// Usamos 'jest.fn()' para criar funções falsas que podemos espiar.
const mockCategoryRepository: ICategoryRepository = {
  findAllByCatalogId: jest.fn(),
  findByNameAndCatalogId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// 2. Definir dados de teste
const MOCK_CATALOG_ID = 'catalog_123';
const mockCategory: Category = {
  id: 'cat_1',
  name: 'Copos',
  catalogId: MOCK_CATALOG_ID,
};

describe('CategoryService', () => {
  let categoryService: CategoryService;

  // 3. Preparar o ambiente antes de CADA teste
  beforeEach(() => {
    // Limpar o histórico de todas as simulações
    jest.clearAllMocks();
    
    // Criar uma nova instância do serviço com o repositório simulado
    // Isto garante que cada teste é independente (não partilham estado).
    categoryService = new CategoryService(mockCategoryRepository);
  });

  // Testar o método 'getAllCategories'
  it('deve chamar o repositório e retornar todas as categorias', async () => {
    // Preparação: Dizemos ao mock o que deve retornar
    (mockCategoryRepository.findAllByCatalogId as jest.Mock).mockResolvedValue([mockCategory]);

    // Execução: Chamamos o método do serviço
    const categories = await categoryService.getAllCategories(MOCK_CATALOG_ID);

    // Verificação:
    // 1. O serviço retornou o que o repositório lhe deu?
    expect(categories).toEqual([mockCategory]);
    // 2. O serviço chamou a função correta do repositório?
    expect(mockCategoryRepository.findAllByCatalogId).toHaveBeenCalledWith(MOCK_CATALOG_ID);
    // 3. O serviço chamou a função apenas uma vez?
    expect(mockCategoryRepository.findAllByCatalogId).toHaveBeenCalledTimes(1);
  });

  // Testar o método 'addNewCategory'
  describe('addNewCategory', () => {
    
    it('deve criar uma nova categoria com sucesso se ela não existir', async () => {
      // Preparação:
      // 1. Simular que a categoria 'Bebidas' não existe
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(null);
      // 2. Simular a criação bem-sucedida
      const newCategory = { ...mockCategory, id: 'cat_2', name: 'Bebidas' };
      (mockCategoryRepository.create as jest.Mock).mockResolvedValue(newCategory);

      // Execução:
      const result = await categoryService.addNewCategory('Bebidas', MOCK_CATALOG_ID);

      // Verificação:
      expect(result).toEqual(newCategory);
      // Verificou se existia antes de criar?
      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Bebidas', MOCK_CATALOG_ID);
      // Criou a categoria?
      expect(mockCategoryRepository.create).toHaveBeenCalledWith('Bebidas', MOCK_CATALOG_ID);
    });

    it('deve lançar um erro se o nome for muito curto', async () => {
      // Preparação: (nenhuma é necessária, a lógica deve falhar antes de chamar o repositório)
      const shortName = 'A';

      // Execução e Verificação:
      // Usamos 'rejects.toThrow' para testar erros em funções async
      await expect(
        categoryService.addNewCategory(shortName, MOCK_CATALOG_ID)
      ).rejects.toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");

      // Garantir que não tentou falar com a base de dados
      expect(mockCategoryRepository.findByNameAndCatalogId).not.toHaveBeenCalled();
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar um erro se a categoria já existir', async () => {
      // Preparação: Simular que 'Copos' já existe
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(mockCategory);

      // Execução e Verificação:
      await expect(
        categoryService.addNewCategory('Copos', MOCK_CATALOG_ID)
      ).rejects.toThrow("Esta categoria já existe.");

      // Garante que verificou a existência
      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Copos', MOCK_CATALOG_ID);
      // Garante que NÃO tentou criar
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  // Testar o método 'updateCategory'
  describe('updateCategory', () => {

    it('deve atualizar uma categoria com sucesso', async () => {
      // Preparação:
      const updatedCategory = { ...mockCategory, name: 'Copos Grandes' };
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(mockCategory);
      (mockCategoryRepository.update as jest.Mock).mockResolvedValue(updatedCategory);

      // Execução:
      const result = await categoryService.updateCategory('Copos', 'Copos Grandes', MOCK_CATALOG_ID);

      // Verificação:
      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Copos', MOCK_CATALOG_ID);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('cat_1', 'Copos Grandes');
    });

    it('deve lançar um erro se a categoria a ser atualizada não for encontrada', async () => {
      // Preparação: Simular que 'Categoria Fantasma' não existe
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(null);

      // Execução e Verificação:
      await expect(
        categoryService.updateCategory('Categoria Fantasma', 'Novo Nome', MOCK_CATALOG_ID)
      ).rejects.toThrow("Categoria não encontrada para ser atualizada.");
      
      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Categoria Fantasma', MOCK_CATALOG_ID);
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

     it('deve lançar um erro se o novo nome for muito curto', async () => {
      // Execução e Verificação:
      await expect(
        categoryService.updateCategory('Copos', 'A', MOCK_CATALOG_ID)
      ).rejects.toThrow("O novo nome da categoria deve ter pelo menos 2 caracteres.");
      
      // Não deve nem tentar procurar a categoria se o novo nome for inválido
      expect(mockCategoryRepository.findByNameAndCatalogId).not.toHaveBeenCalled();
    });
  });

  // Testar o método 'deleteCategory'
  describe('deleteCategory', () => {
    
    it('deve apagar uma categoria com sucesso', async () => {
      // Preparação:
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(mockCategory);
      (mockCategoryRepository.delete as jest.Mock).mockResolvedValue(undefined); // 'delete' não retorna nada

      // Execução:
      await categoryService.deleteCategory('Copos', MOCK_CATALOG_ID);

      // Verificação:
      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Copos', MOCK_CATALOG_ID);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat_1');
    });

    it('deve lançar um erro se a categoria a ser apagada não for encontrada', async () => {
      // Preparação:
      (mockCategoryRepository.findByNameAndCatalogId as jest.Mock).mockResolvedValue(null);

      // Execução e Verificação:
      await expect(
        categoryService.deleteCategory('Categoria Fantasma', MOCK_CATALOG_ID)
      ).rejects.toThrow("Categoria não encontrada para ser apagada.");

      expect(mockCategoryRepository.findByNameAndCatalogId).toHaveBeenCalledWith('Categoria Fantasma', MOCK_CATALOG_ID);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});