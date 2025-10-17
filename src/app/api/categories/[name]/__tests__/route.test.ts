import { DELETE, PUT } from '../route';
import type { NextRequest } from 'next/server';

// ✅ Mock criado dentro da função, para evitar hoisting
jest.mock('@/domain/services/CategoryService', () => {
  const mockUpdateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();

  return {
    CategoryService: jest.fn().mockImplementation(() => ({
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
    })),
    __mocks__: { mockUpdateCategory, mockDeleteCategory },
  };
});

const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
const { mockUpdateCategory, mockDeleteCategory } = __mocks__;

describe('API Route: /api/categories/[name]', () => {
  beforeEach(() => {
    mockUpdateCategory.mockReset();
    mockDeleteCategory.mockReset();
  });

  describe('DELETE', () => {
    it('deve apagar a categoria (204)', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);

      const categoryName = 'Comidas';
      const request = new Request(`http://localhost/api/categories/${categoryName}`, { method: 'DELETE' });
      const context = { params: { name: categoryName } };
      const response = await DELETE(request as NextRequest, context);

      expect(mockDeleteCategory).toHaveBeenCalledWith(categoryName, expect.any(String));
      expect(response.status).toBe(204);
    });
  });

  describe('PUT', () => {
    it('deve atualizar a categoria (200)', async () => {
      const updated = { id: 'cat_1', name: 'Pratos Quentes' };
      mockUpdateCategory.mockResolvedValue(updated);

      const request = new Request('http://localhost/api/categories/Comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: 'Pratos Quentes' }),
      });
      const context = { params: { name: 'Comidas' } };
      const response = await PUT(request as NextRequest, context);
      const body = await response.json();

      expect(mockUpdateCategory).toHaveBeenCalledWith('Comidas', 'Pratos Quentes', expect.any(String));
      expect(response.status).toBe(200);
      expect(body).toEqual(updated);
    });
  });
});
