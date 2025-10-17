// src/app/api/categories/[name]/__tests__/route.test.ts
import { DELETE, PUT } from '../route';
import type { NextRequest } from 'next/server';

// ✅ CORREÇÃO 1: Adicionamos 'mockGetAllCategories' à nossa simulação.
jest.mock('@/domain/services/CategoryService', () => {
  const mockUpdateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockGetAllCategories = jest.fn(); // <-- ADICIONADO AQUI

  return {
    CategoryService: jest.fn().mockImplementation(() => ({
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
      getAllCategories: mockGetAllCategories, // <-- E AQUI
    })),
    __mocks__: { mockUpdateCategory, mockDeleteCategory, mockGetAllCategories }, // <-- E AQUI
  };
});

const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
// ✅ CORREÇÃO 2: Importamos o novo mock para o podermos usar nos testes.
const { mockUpdateCategory, mockDeleteCategory, mockGetAllCategories } = __mocks__;

describe('API Route: /api/categories/[name]', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste.
    mockUpdateCategory.mockReset();
    mockDeleteCategory.mockReset();
    mockGetAllCategories.mockReset();
  });

  describe('DELETE', () => {
    it('deve apagar a categoria e retornar a lista atualizada com status 200', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);
      // ✅ CORREÇÃO 3: Simulamos o que 'getAllCategories' vai retornar após a exclusão.
      mockGetAllCategories.mockResolvedValue([{ id: 'cat_2', name: 'Bebidas' }]);

      const categoryName = 'Comidas';
      const request = new Request(`http://localhost/api/categories/${categoryName}`, { method: 'DELETE' });
      const context = { params: { name: categoryName } };
      const response = await DELETE(request as NextRequest, context);
      const body = await response.json();

      expect(mockDeleteCategory).toHaveBeenCalledWith(categoryName, expect.any(String));
      expect(mockGetAllCategories).toHaveBeenCalled(); // Verificamos se foi chamado

      // ✅ CORREÇÃO 4: A API agora retorna 200, e não 204.
      expect(response.status).toBe(200);
      expect(body).toEqual([{ id: 'cat_2', name: 'Bebidas' }]); // Verificamos o corpo da resposta
    });
  });

  describe('PUT', () => {
    it('deve atualizar a categoria e retornar a lista atualizada com status 200', async () => {
      const updatedCategory = { id: 'cat_1', name: 'Pratos Quentes' };
      mockUpdateCategory.mockResolvedValue(updatedCategory);
      // ✅ CORREÇÃO 5: Fazemos o mesmo para o teste de atualização.
      mockGetAllCategories.mockResolvedValue([updatedCategory]);

      const request = new Request('http://localhost/api/categories/Comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: 'Pratos Quentes' }),
      });
      const context = { params: { name: 'Comidas' } };
      const response = await PUT(request as NextRequest, context);
      const body = await response.json();

      expect(mockUpdateCategory).toHaveBeenCalledWith('Comidas', 'Pratos Quentes', expect.any(String));
      expect(mockGetAllCategories).toHaveBeenCalled();

      expect(response.status).toBe(200);
      // ✅ CORREÇÃO 6: O corpo da resposta é a lista completa, não apenas o item atualizado.
      expect(body).toEqual([updatedCategory]);
    });
  });
});