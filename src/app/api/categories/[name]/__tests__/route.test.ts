// src/app/api/categories/[name]/__tests__/route.test.ts
import { DELETE, PUT } from '../route';

// A biblioteca 'node-mocks-http' foi removida, pois não é necessária aqui.

// --- Variável para simular os dados ---
let mockCategories = ["Bebidas", "Comidas", "Sobremesas"];

// --- Mock da Rota Principal (continua igual e correto) ---
jest.mock('@/app/api/categories/route', () => ({
  __esModule: true, 
  get categories() {
    return mockCategories;
  },
  set categories(newVal: string[]) {
    mockCategories = newVal;
  },
}));

describe('API Route: /api/categories/[name]', () => {

  // Reseta os dados antes de cada teste
  beforeEach(() => {
    mockCategories = ["Bebidas", "Comidas", "Sobremesas"];
  });

  // --- Testes para a função DELETE ---
  describe('DELETE', () => {
    it('deve apagar uma categoria existente e retornar a lista atualizada', async () => {
      const categoryToDelete = "Comidas";
      
      // 1. MUDANÇA: Criamos um objeto 'Request' real, como o Next.js faria.
      const request = new Request(`http://localhost/api/categories/${categoryToDelete}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { name: categoryToDelete } });
      const updatedCategories = await response.json();

      expect(response.status).toBe(200);
      expect(updatedCategories).not.toContain(categoryToDelete);
      expect(updatedCategories).toEqual(["Bebidas", "Sobremesas"]);
    });

    it('deve retornar um erro 404 se a categoria não existir', async () => {
        const request = new Request('http://localhost/api/categories/Inexistente', { method: 'DELETE' });
        const response = await DELETE(request, { params: { name: "CategoriaInexistente" } });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('Categoria não encontrada.');
    });
  });

  // --- Testes para a função PUT ---
  describe('PUT', () => {
    it('deve editar uma categoria existente e retornar a lista atualizada', async () => {
        const originalCategory = "Comidas";
        const newName = "Pratos Quentes";

        // 2. MUDANÇA: Criamos um 'Request' com método 'PUT' e um corpo (body).
        const request = new Request(`http://localhost/api/categories/${originalCategory}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName: newName }),
        });

        const response = await PUT(request, { params: { name: originalCategory }});
        const updatedCategories = await response.json();

        expect(response.status).toBe(200);
        expect(updatedCategories).toContain(newName);
        expect(updatedCategories).not.toContain(originalCategory);
    });
  });
});