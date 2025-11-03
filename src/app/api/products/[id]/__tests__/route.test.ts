// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import type { NextRequest } from 'next/server';
// ✅ CORREÇÃO: Importar tipos do Prisma para mocks corretos
import type { Product, Specification, PriceTier } from '@prisma/client';

// 1. A criação das funções de mock (como estava)
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

// 2. Usamos 'jest.requireMock' (como estava)
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProductById, mockUpdateProduct, mockDeleteProduct } = __mocks__;

// ✅ CORREÇÃO: Definir tipos para os mocks
type MockProduct = Product & { specifications: Specification | null; priceTable: PriceTier[] };

describe('API Route: /api/products/[id]', () => {

  // ✅ CORREÇÃO: Declarar as variáveis de mock aqui
  let mockProducts: MockProduct[];
  let mockProduct: MockProduct;

  beforeEach(() => {
    // Limpar mocks
    mockGetProductById.mockClear();
    mockUpdateProduct.mockClear();
    mockDeleteProduct.mockClear();

    // ✅ CORREÇÃO: Definir os dados com IDs de STRING (como no Prisma)
    mockProduct = { 
      id: 'prod_1', name: 'Produto A', categoryId: 'cat_1', slug: 'produto-a', 
      shortDescription: '', description: '', images: [], specifications: null, 
      priceTable: [{ id: 'pt1', quantity: '10-29', price: 10, productId: 'prod_1' }], 
      priceInfo: '', isFeatured: false, catalogId: 'cat123' 
    };
    mockProducts = [
      mockProduct,
      { 
        id: 'prod_2', name: 'Produto B', categoryId: 'cat_2', slug: 'produto-b', 
        shortDescription: '', description: '', images: [], specifications: null, 
        priceTable: [{ id: 'pt2', quantity: '10-29', price: 20, productId: 'prod_2' }], 
        priceInfo: '', isFeatured: false, catalogId: 'cat123' 
      },
    ];
  });

  describe('GET', () => {
    it('deve retornar um produto existente com status 200', async () => {
      mockGetProductById.mockResolvedValue(mockProduct); // Simular o retorno
      
      const request = new Request('http://localhost/api/products/prod_1');
      
      // ✅ CORREÇÃO: 'context' agora é um objeto simples, sem Promise.
      const context = { params: { id: 'prod_1' } }; 
      
      const response = await GET(request as NextRequest, context);
      const product = await response.json();

      expect(mockGetProductById).toHaveBeenCalledWith('prod_1'); // Verificar ID string
      expect(response.status).toBe(200);
      expect(product).toEqual(mockProduct);
    });

    it('deve retornar um erro 404 se o produto não for encontrado', async () => {
      mockGetProductById.mockResolvedValue(null); // Simular não encontrar

      const request = new Request('http://localhost/api/products/99');
      
      // ✅ CORREÇÃO: 'context' agora é um objeto simples, sem Promise.
      const context = { params: { id: '99' } };
      
      const response = await GET(request as NextRequest, context);
      const body = await response.json();

      expect(mockGetProductById).toHaveBeenCalledWith('99');
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
      
      // ✅ CORREÇÃO: 'context' agora é um objeto simples, sem Promise.
      const context = { params: { id: 'prod_1' } };
      
      const response = await PUT(request as NextRequest, context);
      const product = await response.json();

      expect(mockUpdateProduct).toHaveBeenCalledWith('prod_1', updatedData);
      expect(response.status).toBe(200);
      expect(product).toEqual(updatedProduct);
    });
  });

  describe('DELETE', () => {
    it('deve apagar um produto existente e retornar status 204', async () => {
      mockDeleteProduct.mockResolvedValue(undefined); // DELETE não retorna nada
      
      const request = new Request('http://localhost/api/products/prod_2', { method: 'DELETE' });
      
      // ✅ CORREÇÃO: 'context' agora é um objeto simples, sem Promise.
      const context = { params: { id: 'prod_2' } };
      
      const response = await DELETE(request as NextRequest, context);

      expect(mockDeleteProduct).toHaveBeenCalledWith('prod_2');
      expect(response.status).toBe(204);
    });
  });
});