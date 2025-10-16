// src/app/api/categories/[name]/__tests__/route.test.ts
import { DELETE, PUT } from '../route';
import type { NextRequest } from 'next/server';

let mockCategories: string[];

jest.mock('@/app/api/categories/data', () => ({
  __esModule: true,
  get categories() { return mockCategories; },
  set categories(newValue: string[]) { mockCategories = newValue; }
}));

describe('API Route: /api/categories/[name]', () => {
  beforeEach(() => {
    mockCategories = ["Bebidas", "Comidas", "Sobremesas"];
  });

  describe('DELETE', () => {
    it('deve apagar uma categoria existente e retornar a lista atualizada', async () => {
      const categoryToDelete = "Comidas";
      const request = new Request(`http://localhost/api/categories/${categoryToDelete}`, { method: 'DELETE' });

      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ name: categoryToDelete }) };
      const response = await DELETE(request as NextRequest, context);

      const updatedCategories = await response.json();
      expect(response.status).toBe(200);
      expect(updatedCategories).not.toContain(categoryToDelete);
    });

    it('deve retornar um erro 404 se a categoria não existir', async () => {
      const request = new Request('http://localhost/api/categories/Inexistente', { method: 'DELETE' });

      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ name: "CategoriaInexistente" }) };
      const response = await DELETE(request as NextRequest, context);

      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body.error).toBe('Categoria não encontrada.');
    });
  });

  describe('PUT', () => {
    it('deve editar uma categoria existente e retornar a lista atualizada', async () => {
      const originalCategory = "Comidas";
      const newName = "Pratos Quentes";
      const request = new Request(`http://localhost/api/categories/${originalCategory}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });

      // ✅ CORREÇÃO: Envolvemos os parâmetros numa Promise
      const context = { params: Promise.resolve({ name: originalCategory }) };
      const response = await PUT(request as NextRequest, context);

      const updatedCategories = await response.json();
      expect(response.status).toBe(200);
      expect(updatedCategories).toContain(newName);
    });
  });
});