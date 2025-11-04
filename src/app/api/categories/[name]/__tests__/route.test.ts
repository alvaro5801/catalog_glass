// src/app/api/categories/[name]/__tests__/route.test.ts
import { DELETE, PUT } from '../route';
import type { NextRequest } from 'next/server';

// Simulação (como estava, correta)
jest.mock('@/domain/services/CategoryService', () => {
  const mockUpdateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockGetAllCategories = jest.fn(); 

  return {
    CategoryService: jest.fn().mockImplementation(() => ({
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
      getAllCategories: mockGetAllCategories, 
    })),
    __mocks__: { mockUpdateCategory, mockDeleteCategory, mockGetAllCategories }, 
  };
});

const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
const { mockUpdateCategory, mockDeleteCategory, mockGetAllCategories } = __mocks__;

describe('API Route: /api/categories/[name]', () => {
  beforeEach(() => {
    mockUpdateCategory.mockReset();
    mockDeleteCategory.mockReset();
    mockGetAllCategories.mockReset();
  });

  describe('DELETE', () => {
    it('deve apagar a categoria e retornar a lista atualizada com status 200', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);
      mockGetAllCategories.mockResolvedValue([{ id: 'cat_2', name: 'Bebidas' }]);

      const categoryName = 'Comidas';
      const request = new Request(`http://localhost/api/categories/${categoryName}`, { method: 'DELETE' });
      
      // ✅ CORREÇÃO: Embrulhar os 'params' numa Promise.resolve()
      const context = { params: Promise.resolve({ name: categoryName }) }; 
      
      const response = await DELETE(request as NextRequest, context);
      const body = await response.json();

      expect(mockDeleteCategory).toHaveBeenCalledWith(categoryName, expect.any(String));
      expect(mockGetAllCategories).toHaveBeenCalled(); 
      expect(response.status).toBe(200);
      expect(body).toEqual([{ id: 'cat_2', name: 'Bebidas' }]); 
    });
  });

  describe('PUT', () => {
    it('deve atualizar a categoria e retornar a lista atualizada com status 200', async () => {
      mockUpdateCategory.mockResolvedValue({ id: 'cat_1', name: 'Pratos Quentes' });
      mockGetAllCategories.mockResolvedValue([{ id: 'cat_1', name: 'Pratos Quentes' }]);

      const request = new Request('http://localhost/api/categories/Comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: 'Pratos Quentes' }),
      });
      
      // ✅ CORREÇÃO: Embrulhar os 'params' numa Promise.resolve()
      const context = { params: Promise.resolve({ name: 'Comidas' }) };
      
      const response = await PUT(request as NextRequest, context);
      const body = await response.json();

      expect(mockUpdateCategory).toHaveBeenCalledWith('Comidas', 'Pratos Quentes', expect.any(String));
      expect(mockGetAllCategories).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(body).toEqual([{ id: 'cat_1', name: 'Pratos Quentes' }]);
    });
  });
});