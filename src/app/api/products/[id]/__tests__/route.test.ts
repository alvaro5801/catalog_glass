// src/app/api/products/[id]/__tests__/route.test.ts
import { GET, PUT, DELETE } from '../route';
import type { Product } from '@/lib/types';

// --- Simulação dos Dados ---
let mockProducts: Product[];

// Simula o módulo de dados para que possamos resetar os produtos a cada teste.
jest.mock('@/data/products', () => ({
  get products() {
    return mockProducts;
  },
}));

describe('API Route: /api/products/[id]', () => {

  // Antes de cada teste, reiniciamos a nossa base de dados simulada
  beforeEach(() => {
    mockProducts = [
      { 
        id: 1, 
        name: 'Produto A', 
        category: 'Cat 1', 
        slug: 'produto-a', 
        shortDescription: '', 
        description: '', 
        images: [], 
        specifications: { material: '', capacidade: '', dimensoes: '' }, 
        priceTable: [{ quantity: '10-29', price: 10 }], 
        priceInfo: '' 
      },
      { 
        id: 2, 
        name: 'Produto B', 
        category: 'Cat 2', 
        slug: 'produto-b', 
        shortDescription: '', 
        description: '', 
        images: [], 
        specifications: { material: '', capacidade: '', dimensoes: '' }, 
        priceTable: [{ quantity: '10-29', price: 20 }], 
        priceInfo: '' 
      },
    ];
  });

  // --- Testes para a função GET ---
  describe('GET', () => {
    it('deve retornar um produto existente com status 200', async () => {
      const request = new Request('http://localhost/api/products/1');
      const response = await GET(request, { params: { id: '1' } });
      const product = await response.json();

      expect(response.status).toBe(200);
      expect(product.id).toBe(1);
      expect(product.name).toBe('Produto A');
    });

    it('deve retornar um erro 404 se o produto não for encontrado', async () => {
      const request = new Request('http://localhost/api/products/99');
      const response = await GET(request, { params: { id: '99' } });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Produto não encontrado.');
    });
  });

  // --- Testes para a função PUT ---
  describe('PUT', () => {
    it('deve atualizar um produto existente e retorná-lo com status 200', async () => {
      const updatedData = { 
          name: 'Produto A Atualizado', 
          priceTable: [{ quantity: '10-29', price: 15.5 }] 
      };
      const request = new Request('http://localhost/api/products/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const product = await response.json();

      expect(response.status).toBe(200);
      expect(product.name).toBe('Produto A Atualizado');
      expect(product.priceTable[0].price).toBe(15.5);
      // Garante que o array original foi modificado
      expect(mockProducts.find(p => p.id === 1)?.name).toBe('Produto A Atualizado');
    });

     it('deve retornar um erro 404 ao tentar atualizar um produto inexistente', async () => {
        const request = new Request('http://localhost/api/products/99', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Inexistente' }),
        });
        const response = await PUT(request, { params: { id: '99' }});
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('Produto não encontrado.');
    });
  });

  // --- Testes para a função DELETE ---
  describe('DELETE', () => {
    it('deve apagar um produto existente e retornar status 204', async () => {
      const request = new Request('http://localhost/api/products/2', { method: 'DELETE' });
      const response = await DELETE(request, { params: { id: '2' } });

      expect(response.status).toBe(204);
      // Garante que o produto foi removido do array original
      expect(mockProducts.find(p => p.id === 2)).toBeUndefined();
      expect(mockProducts.length).toBe(1);
    });

    it('deve retornar um erro 404 ao tentar apagar um produto inexistente', async () => {
        const request = new Request('http://localhost/api/products/99', { method: 'DELETE' });
        const response = await DELETE(request, { params: { id: '99' }});
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('Produto não encontrado.');
    });
  });
});