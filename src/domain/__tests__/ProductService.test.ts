// src/domain/services/__tests__/ProductService.test.ts
import { ProductService } from '@/domain/services/ProductService';
import type { IProductRepository, CreateProductData } from '@/domain/interfaces/IProductRepository';
import type { Product, Specification, PriceTier } from '@prisma/client';

// 1. Criar um "mock" (simulação) do Repositório de Produtos
const mockProductRepository: IProductRepository = {
  findAllByCatalogId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// 2. Definir dados de teste
const MOCK_CATALOG_ID = 'catalog_123';

// Mock de um produto completo (como viria da base de dados)
const mockProduct: Product & { specifications: Specification | null; priceTable: PriceTier[] } = {
  id: 'prod_1',
  name: 'Copo Long Drink',
  slug: 'copo-long-drink',
  shortDescription: 'Descrição curta',
  description: 'Descrição longa',
  images: ['/img.jpg'],
  priceInfo: 'Preço info',
  isFeatured: false,
  categoryId: 'cat_1',
  catalogId: MOCK_CATALOG_ID,
  // Relações
  specifications: { id: 'spec_1', material: 'Acrílico', capacidade: '300ml', dimensoes: '15cm', productId: 'prod_1' },
  priceTable: [{ id: 'price_1', quantity: '100+', price: 3.50, productId: 'prod_1' }],
};

// Mock de dados para a criação de um novo produto
const mockCreateData: CreateProductData = {
  name: 'Novo Copo',
  slug: 'novo-copo',
  shortDescription: '...',
  description: '...',
  images: ['/novo.jpg'],
  priceInfo: '...',
  isFeatured: false,
  categoryId: 'cat_1',
  catalogId: MOCK_CATALOG_ID,
  specifications: { create: { material: 'Novo', capacidade: '100ml', dimensoes: '10cm' } },
  priceTable: { create: [{ quantity: '1-10', price: 10 }] },
};


describe('ProductService', () => {
  let productService: ProductService;

  // 3. Preparar o ambiente antes de CADA teste
  beforeEach(() => {
    // Limpar o histórico de todas as simulações
    jest.clearAllMocks();
    
    // Criar uma nova instância do serviço com o repositório simulado
    productService = new ProductService(mockProductRepository);
  });

  // Testar 'getProducts' (passthrough)
  it('deve chamar o repositório e retornar todos os produtos', async () => {
    (mockProductRepository.findAllByCatalogId as jest.Mock).mockResolvedValue([mockProduct]);
    const products = await productService.getProducts(MOCK_CATALOG_ID);
    
    expect(products).toEqual([mockProduct]);
    expect(mockProductRepository.findAllByCatalogId).toHaveBeenCalledWith(MOCK_CATALOG_ID);
  });

  // Testar 'getProductById' (passthrough)
  it('deve chamar o repositório e retornar um produto por ID', async () => {
    (mockProductRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
    const product = await productService.getProductById('prod_1');
    
    expect(product).toEqual(mockProduct);
    expect(mockProductRepository.findById).toHaveBeenCalledWith('prod_1');
  });

  // Testar 'updateProduct' (passthrough)
  it('deve chamar o repositório para atualizar um produto', async () => {
    const updatePayload = { name: 'Nome Atualizado' };
    const updatedProduct = { ...mockProduct, ...updatePayload };
    (mockProductRepository.update as jest.Mock).mockResolvedValue(updatedProduct);
    
    const product = await productService.updateProduct('prod_1', updatePayload);

    expect(product).toEqual(updatedProduct);
    expect(mockProductRepository.update).toHaveBeenCalledWith('prod_1', updatePayload);
  });

  // Testar 'createProduct' (contém lógica de negócio)
  describe('createProduct', () => {

    it('deve criar um produto com sucesso se os dados forem válidos', async () => {
      (mockProductRepository.create as jest.Mock).mockResolvedValue(mockProduct);
      
      const product = await productService.createProduct(mockCreateData);

      expect(product).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(mockCreateData);
    });

    it('deve lançar um erro se o nome for muito curto', async () => {
      // Preparação: Criar dados inválidos
      const invalidData = { ...mockCreateData, name: 'A' };

      // Execução e Verificação:
      await expect(
        productService.createProduct(invalidData)
      ).rejects.toThrow("O nome do produto deve ter pelo menos 3 caracteres.");

      // Garantir que não tentou salvar na base de dados
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });
  });

  // Testar 'deleteProduct' (contém lógica de negócio)
  describe('deleteProduct', () => {

    it('deve apagar um produto se ele for encontrado', async () => {
      // Preparação:
      // 1. Simular que o produto existe
      (mockProductRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      // 2. Simular a deleção (não retorna nada)
      (mockProductRepository.delete as jest.Mock).mockResolvedValue(undefined);

      // Execução:
      await productService.deleteProduct('prod_1');

      // Verificação:
      // Verificou se existia?
      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod_1');
      // Apagou?
      expect(mockProductRepository.delete).toHaveBeenCalledWith('prod_1');
    });

    it('deve lançar um erro se o produto a ser apagado não for encontrado', async () => {
      // Preparação: Simular que o produto NÃO existe
      (mockProductRepository.findById as jest.Mock).mockResolvedValue(null);

      // Execução e Verificação:
      await expect(
        productService.deleteProduct('prod_fantasma')
      ).rejects.toThrow("Produto não encontrado.");

      // Verificou se existia?
      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod_fantasma');
      // NÃO tentou apagar?
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });
});