// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import type { NextRequest } from 'next/server';

// ✅ 1. A criação das funções de mock agora acontece DENTRO do jest.mock.
// Isto garante que elas existem no momento em que a simulação é necessária.
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
    // ✅ 2. Exportamos as funções de mock para que o nosso teste possa acedê-las.
    __mocks__: { mockGetProductById, mockUpdateProduct, mockDeleteProduct },
  };
});

// ✅ 3. Usamos 'jest.requireMock' para obter uma referência aos mocks que criámos.
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProductById, mockUpdateProduct, mockDeleteProduct } = __mocks__;

describe('API Route: /api/products/[id]', () => {
  // ✅ 4. Usamos 'jest.clearAllMocks()' para limpar o estado dos mocks antes de cada teste.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve chamar o serviço e retornar o produto com status 200', async () => {
      const mockProduct = { id: 'prod_1', name: 'Produto A' };
      mockGetProductById.mockResolvedValue(mockProduct);

      const request = new Request('http://localhost/api/products/prod_1');
      const context = { params: { id: 'prod_1' } };
      const response = await GET(request as NextRequest, context);
      const product = await response.json();

      expect(mockGetProductById).toHaveBeenCalledWith('prod_1');
      expect(response.status).toBe(200);
      expect(product).toEqual(mockProduct);
    });

    it('deve retornar 404 se o serviço não encontrar o produto', async () => {
      mockGetProductById.mockResolvedValue(null);

      const request = new Request('http://localhost/api/products/prod_99');
      const context = { params: { id: 'prod_99' } };
      const response = await GET(request as NextRequest, context);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('deve chamar o serviço de atualização e retornar o produto atualizado com status 200', async () => {
      const updatedData = { name: 'Produto A Atualizado' };
      const updatedProduct = { id: 'prod_1', ...updatedData };
      mockUpdateProduct.mockResolvedValue(updatedProduct);

      const request = new Request('http://localhost/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      const context = { params: { id: 'prod_1' } };
      const response = await PUT(request as NextRequest, context);
      const product = await response.json();

      expect(mockUpdateProduct).toHaveBeenCalledWith('prod_1', updatedData);
      expect(response.status).toBe(200);
      expect(product).toEqual(updatedProduct);
    });
  });

  describe('DELETE', () => {
    it('deve chamar o serviço de apagar e retornar status 204', async () => {
      mockDeleteProduct.mockResolvedValue(undefined);

      const request = new Request('http://localhost/api/products/prod_2', { method: 'DELETE' });
      const context = { params: { id: 'prod_2' } };
      const response = await DELETE(request as NextRequest, context);

      expect(mockDeleteProduct).toHaveBeenCalledWith('prod_2');
      expect(response.status).toBe(204);
    });
  });
});