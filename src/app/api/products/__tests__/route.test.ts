// src/app/api/products/__tests__/route.test.ts
import { GET, POST } from '../route'; // Importa do ficheiro de rota que criámos
import { NextRequest } from 'next/server';
import type { Product, Specification, PriceTier } from '@prisma/client';
import type { CreateProductData } from '@/domain/interfaces/IProductRepository';

// 1. Simular (mock) o ProductService (como nos outros testes de API)
jest.mock('@/domain/services/ProductService', () => {
  const mockGetProducts = jest.fn();
  const mockCreateProduct = jest.fn();
  const mockGetProductById = jest.fn();
  const mockUpdateProduct = jest.fn();
  const mockDeleteProduct = jest.fn();
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProducts: mockGetProducts,
      createProduct: mockCreateProduct,
      getProductById: mockGetProductById,
      updateProduct: mockUpdateProduct,
      deleteProduct: mockDeleteProduct,
    })),
    __mocks__: { mockGetProducts, mockCreateProduct }, // Exportar os que vamos usar
  };
});

// 2. Mockar o ProductRepository (dependência da rota)
jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn().mockImplementation(() => {}),
}));

// 3. Obter referência aos mocks
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProducts, mockCreateProduct } = __mocks__;

// 4. Dados de Teste
const mockProduct: Product & { specifications: Specification | null; priceTable: PriceTier[] } = {
  id: 'prod_1', name: 'Copo Long Drink', slug: 'copo-long-drink', shortDescription: '...', description: '...', images: ['/img.jpg'], priceInfo: '...', isFeatured: false, categoryId: 'cat_1', catalogId: 'catalog_123', specifications: null, priceTable: [],
};

// --- ESTA É A CORREÇÃO ---
const mockCreateData: CreateProductData = {
  name: 'Novo Copo', slug: 'novo-copo', shortDescription: '...', description: '...', images: ['/novo.jpg'], priceInfo: '...', isFeatured: false,
  // categoryId: 'cat_1', // <-- Erro aqui
  // catalogId: 'catalog_123', // <-- E erro aqui

  // Correção para 'categoryId'
  category: {
    connect: {
      id: 'cat_1'
    }
  },
  // Correção para 'catalogId'
  catalog: {
    connect: {
      id: 'catalog_123'
    }
  },

  specifications: { create: { material: 'Novo', capacidade: '100ml', dimensoes: '10cm' } },
  priceTable: { create: [{ quantity: '1-10', price: 10 }] },
};
// --- FIM DA CORREÇÃO ---


// --- Início dos Testes ---
describe('API Route: /api/products', () => {

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    mockGetProducts.mockClear();
    mockCreateProduct.mockClear();
  });

  // Testes para a função GET
  describe('GET', () => {
    it('deve retornar a lista de produtos e status 200', async () => {
      mockGetProducts.mockResolvedValue([mockProduct]); // Simular resposta do serviço
      const response = await GET(); // Chamar a função GET da rota
      const body = await response.json();
      // Verificar
      expect(response.status).toBe(200);
      expect(body).toEqual([mockProduct]);
      expect(mockGetProducts).toHaveBeenCalledTimes(1);
    });

    it('deve retornar um erro 500 se o serviço falhar', async () => {
      mockGetProducts.mockRejectedValue(new Error('Erro de BD')); // Simular erro
      const response = await GET();
      const body = await response.json();
      // Verificar
      expect(response.status).toBe(500);
      expect(body.error).toContain("Erro ao buscar produtos");
    });
  });

  // Testes para a função POST
  describe('POST', () => {
    it('deve criar um novo produto e retornar 201', async () => {
      mockCreateProduct.mockResolvedValue(mockProduct); // Simular sucesso na criação
      
      const request = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(mockCreateData), // Usar os dados corrigidos
      });
      const response = await POST(request);
      const body = await response.json();
      // Verificar
      expect(response.status).toBe(201);
      expect(body).toEqual(mockProduct);
      expect(mockCreateProduct).toHaveBeenCalledWith(mockCreateData); // O serviço será chamado com os dados corretos
    });

    it('deve retornar 400 se a validação do serviço falhar (ex: nome curto)', async () => {
      const invalidData = { ...mockCreateData, name: 'A' };
      mockCreateProduct.mockRejectedValue(new Error("O nome do produto deve ter pelo menos 3 caracteres."));
      
      const request = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });
      const response = await POST(request);
      const body = await response.json();
      // Verificar
      expect(response.status).toBe(400);
      expect(body.error).toBe("O nome do produto deve ter pelo menos 3 caracteres.");
    });
  });
});