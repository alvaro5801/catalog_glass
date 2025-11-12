// src/app/api/products/__tests__/route.test.ts
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import type { Product, Specification, PriceTier } from '@prisma/client';
import type { CreateProductData } from '@/domain/interfaces/IProductRepository';

// --- 1. MOCKS DOS SERVIÇOS ---
jest.mock('@/domain/services/ProductService', () => {
  const mockGetProducts = jest.fn();
  const mockCreateProduct = jest.fn();
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProducts: mockGetProducts,
      createProduct: mockCreateProduct,
    })),
    __mocks__: { mockGetProducts, mockCreateProduct },
  };
});

// Mockar o Repositório (dependência interna do serviço)
jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn().mockImplementation(() => {}),
}));

// ✅ NOVO: Mockar o Auth Helper para simular login e catálogo
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// --- 2. REFERÊNCIAS AOS MOCKS ---
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProducts, mockCreateProduct } = __mocks__;
// Importar as funções mockadas do auth-helper
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// --- 3. DADOS DE TESTE ---
const MOCK_CATALOG_ID = 'catalog_123_user_real';

const mockProduct: Product & { specifications: Specification | null; priceTable: PriceTier[] } = {
  id: 'prod_1', 
  name: 'Copo Long Drink', 
  slug: 'copo-long-drink', 
  shortDescription: '...', 
  description: '...', 
  images: ['/img.jpg'], 
  priceInfo: '...', 
  isFeatured: false, 
  categoryId: 'cat_1', 
  catalogId: MOCK_CATALOG_ID, 
  specifications: null, 
  priceTable: [],
};

// O corpo da requisição (o que vem do frontend)
// Nota: Não enviamos 'catalogId' aqui porque o backend agora decide isso.
const requestBody = {
  name: 'Novo Copo', 
  slug: 'novo-copo', 
  shortDescription: '...', 
  description: '...', 
  images: ['/novo.jpg'], 
  priceInfo: '...', 
  isFeatured: false,
  categoryId: 'cat_1', // O backend vai converter isto para { connect: ... }
  specifications: { create: { material: 'Novo', capacidade: '100ml', dimensoes: '10cm' } },
  priceTable: { create: [{ quantity: '1-10', price: 10 }] },
};

describe('API Route: /api/products', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TESTES GET (Público) ---
  describe('GET', () => {
    it('deve retornar a lista de produtos (modo vitrine) e status 200', async () => {
      mockGetProducts.mockResolvedValue([mockProduct]); 
      
      // GET não precisa de auth por enquanto (conforme a nossa regra de negócio atual)
      const req = new NextRequest('http://localhost/api/products');
      const response = await GET(req); 
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual([mockProduct]);
    });
  });

  // --- TESTES POST (Protegido) ---
  describe('POST', () => {
    
    it('🚫 deve retornar 401 se o utilizador NÃO estiver logado', async () => {
      // Simular sem sessão
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toMatch(/Não autorizado/);
      expect(mockCreateProduct).not.toHaveBeenCalled(); // Garante que nada foi criado
    });

    it('✅ deve criar produto se autenticado, injetando o catalogId correto', async () => {
      // 1. Preparação: Simular Utilizador Logado
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      // 2. Simular que este utilizador tem o catálogo "catalog_123_user_real"
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      
      // 3. Simular sucesso do serviço
      mockCreateProduct.mockResolvedValue(mockProduct);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual(mockProduct);

      // 4. VERIFICAÇÃO CRÍTICA DE SEGURANÇA:
      // O serviço deve ter sido chamado com o catalogId que veio da BD (MOCK_CATALOG_ID),
      // e não com qualquer coisa que viesse no request.
      expect(mockCreateProduct).toHaveBeenCalledWith(expect.objectContaining({
        catalog: { connect: { id: MOCK_CATALOG_ID } }, // O nosso teste de "dono do dado"
        name: 'Novo Copo'
      }));
    });
  });
});