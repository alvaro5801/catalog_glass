// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';
import type { Product, Specification, PriceTier } from '@prisma/client';

// --- 1. MOCKS DOS SERVIÇOS ---
jest.mock('@/domain/services/ProductService', () => {
  const mockGetProductById = jest.fn();
  const mockUpdateProduct = jest.fn();
  const mockDeleteProduct = jest.fn();
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProductById: mockGetProductById,
      updateProduct: mockUpdateProduct,
      deleteProduct: mockDeleteProduct,
    })),
    __mocks__: { mockGetProductById, mockUpdateProduct, mockDeleteProduct },
  };
});

// Mockar o Repositório
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
const { mockGetProductById, mockUpdateProduct, mockDeleteProduct } = __mocks__;
// Importar as funções mockadas do auth-helper
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// --- 3. DADOS DE TESTE ---
const MOCK_CATALOG_ID = 'catalog_user_123'; // ID do catálogo do utilizador

// Produto que pertence ao utilizador (catalogId coincide)
const mockProduct: Product & { specifications: Specification | null; priceTable: PriceTier[] } = {
  id: 'prod_1',
  name: 'Copo Long Drink',
  slug: 'copo-long-drink',
  shortDescription: 'Desc',
  description: 'Desc Completa',
  images: ['/img.jpg'],
  priceInfo: 'R$ 10',
  isFeatured: false,
  categoryId: 'cat_1',
  catalogId: MOCK_CATALOG_ID, // ✅ Importante: Pertence ao user
  specifications: null,
  priceTable: [],
  // createdAt e updatedAt removidos pois não existem no schema Prisma atual
};

describe('API Route: /api/products/[id]', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // ✅ Configuração Padrão de Segurança para os testes
    // Simula que o utilizador está logado e é dono do catálogo MOCK_CATALOG_ID
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
    (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
  });

  // --- GET (Público) ---
  describe('GET', () => {
    it('deve retornar o produto se encontrado (200)', async () => {
      mockGetProductById.mockResolvedValue(mockProduct);
      
      const context = { params: Promise.resolve({ id: 'prod_1' }) };
      const request = new NextRequest('http://localhost/api/products/prod_1');
      
      const response = await GET(request, context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockProduct);
    });

    it('deve retornar 404 se o produto não existir', async () => {
      mockGetProductById.mockResolvedValue(null);
      
      const context = { params: Promise.resolve({ id: 'prod_999' }) };
      const request = new NextRequest('http://localhost/api/products/prod_999');
      
      const response = await GET(request, context);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Produto não encontrado.');
    });
  });

  // --- PUT (Protegido) ---
  describe('PUT', () => {
    it('deve atualizar o produto com sucesso (200)', async () => {
      // 1. O produto existe e pertence ao user (verificado pelo mockProduct.catalogId)
      mockGetProductById.mockResolvedValue(mockProduct);
      
      // 2. Simular o update
      const updatedProduct = { ...mockProduct, name: 'Copo Atualizado' };
      mockUpdateProduct.mockResolvedValue(updatedProduct);

      const body = { name: 'Copo Atualizado' };
      const request = new NextRequest('http://localhost/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const context = { params: Promise.resolve({ id: 'prod_1' }) };

      const response = await PUT(request, context);
      const product = await response.json();

      expect(response.status).toBe(200);
      expect(product).toEqual(updatedProduct);
      
      // Verifica se verificou a propriedade antes de atualizar
      expect(mockGetProductById).toHaveBeenCalledWith('prod_1');
    });

    it('🚫 deve retornar 403 se tentar editar produto de outro catálogo', async () => {
      // Produto de OUTRO catálogo
      const otherProduct = { ...mockProduct, catalogId: 'outro_catalogo_id' };
      mockGetProductById.mockResolvedValue(otherProduct);

      const request = new NextRequest('http://localhost/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Hacker' }),
      });
      const context = { params: Promise.resolve({ id: 'prod_1' }) };

      const response = await PUT(request, context);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toMatch(/Acesso proibido/);
      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });

    it('🚫 deve retornar 401 se não autenticado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/products/prod_1', { method: 'PUT', body: JSON.stringify({}) });
      const context = { params: Promise.resolve({ id: 'prod_1' }) };

      const response = await PUT(request, context);
      expect(response.status).toBe(401);
    });
  });

  // --- DELETE (Protegido) ---
  describe('DELETE', () => {
    it('deve apagar um produto existente (204)', async () => {
      mockGetProductById.mockResolvedValue(mockProduct); // Existe e é meu

      const request = new NextRequest('http://localhost/api/products/prod_1', { method: 'DELETE' });
      const context = { params: Promise.resolve({ id: 'prod_1' }) };

      const response = await DELETE(request, context);

      expect(response.status).toBe(204);
      expect(mockDeleteProduct).toHaveBeenCalledWith('prod_1');
    });

    it('🚫 deve retornar 403 se tentar apagar produto de outro user', async () => {
      const otherProduct = { ...mockProduct, catalogId: 'outro_catalogo_id' };
      mockGetProductById.mockResolvedValue(otherProduct);

      const request = new NextRequest('http://localhost/api/products/prod_1', { method: 'DELETE' });
      const context = { params: Promise.resolve({ id: 'prod_1' }) };

      const response = await DELETE(request, context);

      expect(response.status).toBe(403);
      expect(mockDeleteProduct).not.toHaveBeenCalled();
    });
  });
});