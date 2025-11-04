// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import type { NextRequest } from 'next/server';
import type { Product, Specification, PriceTier } from '@prisma/client';

// Mock do ProductService (como estava)
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

const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProductById, mockUpdateProduct, mockDeleteProduct } = __mocks__;

type MockProduct = Product & { specifications: Specification | null; priceTable: PriceTier[] };

describe('API Route: /api/products/[id]', () => {
  let mockProduct: MockProduct;

  beforeEach(() => {
    mockGetProductById.mockClear();
    mockUpdateProduct.mockClear();
    mockDeleteProduct.mockClear();
    mockProduct = { 
      id: 'prod_1', name: 'Produto A', categoryId: 'cat_1', slug: 'produto-a', 
      shortDescription: '', description: '', images: [], specifications: null, 
      priceTable: [{ id: 'pt1', quantity: '10-29', price: 10, productId: 'prod_1' }], 
      priceInfo: '', isFeatured: false, catalogId: 'cat123' 
    };
  });

  describe('GET', () => {
    it('deve retornar um produto existente com status 200', async () => {
      mockGetProductById.mockResolvedValue(mockProduct);
      const request = new Request('http://localhost/api/products/prod_1');
      // ✅ CORREÇÃO: Embrulhar o 'context' numa Promise
      const context = { params: Promise.resolve({ id: 'prod_1' }) }; 
      const response = await GET(request as NextRequest, context);
      const product = await response.json();
      expect(response.status).toBe(200);
      expect(product).toEqual(mockProduct);
    });

    it('deve retornar um erro 404 se o produto não for encontrado', async () => {
      mockGetProductById.mockResolvedValue(null);
      const request = new Request('http://localhost/api/products/99');
      // ✅ CORREÇÃO: Embrulhar o 'context' numa Promise
      const context = { params: Promise.resolve({ id: '99' }) };
      const response = await GET(request as NextRequest, context);
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body.error).toBe('Produto não encontrado.'); 
    });
  });

  describe('PUT', () => {
    it('deve chamar o serviço de atualização e retornar o produto atualizado com status 200', async () => {
      const updatedData = { name: 'Produto A Atualizado' };
      const updatedProduct = { ...mockProduct, ...updatedData };
      mockUpdateProduct.mockResolvedValue(updatedProduct);

      const request = new Request('http://localhost/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      // ✅ CORREÇÃO: Embrulhar o 'context' numa Promise
      const context = { params: Promise.resolve({ id: 'prod_1' }) };
      const response = await PUT(request as NextRequest, context);
      const product = await response.json();
      expect(response.status).toBe(200);
      expect(product).toEqual(updatedProduct);
    });
  });

  describe('DELETE', () => {
    it('deve apagar um produto existente e retornar status 204', async () => {
      mockDeleteProduct.mockResolvedValue(undefined); 
      const request = new Request('http://localhost/api/products/prod_2', { method: 'DELETE' });
      // ✅ CORREÇÃO: Embrulhar o 'context' numa Promise
      const context = { params: Promise.resolve({ id: 'prod_2' }) };
      const response = await DELETE(request as NextRequest, context);
      expect(response.status).toBe(204);
    });
  });
});