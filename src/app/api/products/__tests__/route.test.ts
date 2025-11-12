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

// Mockar o Repositório
jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn().mockImplementation(() => {}),
}));

// ✅ Mockar o Auth Helper
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// --- 2. REFERÊNCIAS AOS MOCKS ---
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProducts, mockCreateProduct } = __mocks__;
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// --- 3. DADOS DE TESTE ---
const MOCK_CATALOG_ID = 'catalog_123_user_real';

// ✅ CORREÇÃO: Adicionados createdAt e updatedAt
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
  createdAt: new Date(), // Adicionado para corrigir erro de tipo
  updatedAt: new Date(), // Adicionado para corrigir erro de tipo
};

const requestBody = {
  name: 'Novo Copo', 
  slug: 'novo-copo', 
  shortDescription: '...', 
  description: '...', 
  images: ['/novo.jpg'], 
  priceInfo: '...', 
  isFeatured: false,
  categoryId: 'cat_1', 
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
      
      const req = new NextRequest('http://localhost/api/products');
      const response = await GET(req); 
      const body = await response.json();

      expect(response.status).toBe(200);
      
      // ✅ CORREÇÃO: Usamos JSON.parse(JSON.stringify(...)) para normalizar as datas
      // (A API devolve strings ISO, o mock tem objetos Date)
      expect(body).toEqual(JSON.parse(JSON.stringify([mockProduct])));
    });
  });

  // --- TESTES POST (Protegido) ---
  describe('POST', () => {
    
    it('🚫 deve retornar 401 se o utilizador NÃO estiver logado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toMatch(/Não autorizado/);
      expect(mockCreateProduct).not.toHaveBeenCalled(); 
    });

    it('✅ deve criar produto se autenticado, injetando o catalogId correto', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      
      mockCreateProduct.mockResolvedValue(mockProduct);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      // ✅ CORREÇÃO: Normalização de datas aqui também
      expect(body).toEqual(JSON.parse(JSON.stringify(mockProduct)));

      expect(mockCreateProduct).toHaveBeenCalledWith(expect.objectContaining({
        catalog: { connect: { id: MOCK_CATALOG_ID } }, 
        name: 'Novo Copo'
      }));
    });
  });
});