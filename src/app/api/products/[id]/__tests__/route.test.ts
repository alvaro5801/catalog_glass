// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import type { Product } from '@/lib/types';
import type { NextRequest } from 'next/server'; // Importar o tipo

// --- Simulação dos Dados ---
let mockProducts: Product[];

jest.mock('@/data/products', () => ({
  get products() { return mockProducts; },
}));

describe('API Route: /api/products/[id]', () => {
  beforeEach(() => {
    // ... (os seus dados de mock continuam iguais)
    mockProducts = [
      { id: 1, name: 'Produto A', category: 'Cat 1', slug: 'produto-a', shortDescription: '', description: '', images: [], specifications: { material: '', capacidade: '', dimensoes: '' }, priceTable: [{ quantity: '10-29', price: 10 }], priceInfo: '' },
      { id: 2, name: 'Produto B', category: 'Cat 2', slug: 'produto-b', shortDescription: '', description: '', images: [], specifications: { material: '', capacidade: '', dimensoes: '' }, priceTable: [{ quantity: '10-29', price: 20 }], priceInfo: '' },
    ];
  });

  describe('GET', () => {
    it('deve retornar um produto existente com status 200', async () => {
      const request = new Request('http://localhost/api/products/1');
      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ id: '1' }) };
      const response = await GET(request as NextRequest, context);
      const product = await response.json();

      expect(response.status).toBe(200);
      expect(product.id).toBe(1);
    });

    it('deve retornar um erro 404 se o produto não for encontrado', async () => {
      const request = new Request('http://localhost/api/products/99');
      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ id: '99' }) };
      const response = await GET(request as NextRequest, context);
      // ✅ CORREÇÃO: A variável 'body' foi removida, pois não era utilizada.
      await response.json();
      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('deve atualizar um produto existente e retorná-lo com status 200', async () => {
      const updatedData = { name: 'Produto A Atualizado' };
      const request = new Request('http://localhost/api/products/1', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ id: '1' }) };
      const response = await PUT(request as NextRequest, context);
      const product = await response.json();

      expect(response.status).toBe(200);
      expect(product.name).toBe('Produto A Atualizado');
    });
  });

  describe('DELETE', () => {
    it('deve apagar um produto existente e retornar status 204', async () => {
      const request = new Request('http://localhost/api/products/2', { method: 'DELETE' });
      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ id: '2' }) };
      const response = await DELETE(request as NextRequest, context);

      expect(response.status).toBe(204);
      expect(mockProducts.find(p => p.id === 2)).toBeUndefined();
    });
  });
});