// src/app/api/categories/[name]/__tests__/route.test.ts
import { DELETE, PUT } from '../route';
import type { NextRequest } from 'next/server';

// --- 1. Mocks dos Serviços ---
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

// ✅ NOVO: Mockar o Auth Helper para simular login e catálogo
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// --- 2. Referências aos Mocks ---
const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
const { mockUpdateCategory, mockDeleteCategory, mockGetAllCategories } = __mocks__;
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

const MOCK_CATALOG_ID = 'catalog_user_123';

describe('API Route: /api/categories/[name]', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // ✅ Configuração Padrão: Utilizador Autenticado
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
    (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
  });

  describe('DELETE', () => {
    it('deve apagar a categoria e retornar a lista atualizada com status 200', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);
      mockGetAllCategories.mockResolvedValue([{ id: 'cat_2', name: 'Bebidas' }]);

      const categoryName = 'Comidas';
      const request = new Request(`http://localhost/api/categories/${categoryName}`, { method: 'DELETE' });
      const context = { params: Promise.resolve({ name: categoryName }) }; 
      
      const response = await DELETE(request as NextRequest, context);
      const body = await response.json();

      // Verifica se usou o ID do catálogo correto (segurança)
      expect(mockDeleteCategory).toHaveBeenCalledWith(categoryName, MOCK_CATALOG_ID);
      expect(mockGetAllCategories).toHaveBeenCalledWith(MOCK_CATALOG_ID); 
      expect(response.status).toBe(200);
      expect(body).toEqual([{ id: 'cat_2', name: 'Bebidas' }]); 
    });

    it('🚫 deve retornar 401 se o utilizador não estiver logado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null); // Sem sessão

      const request = new Request('http://localhost/api/categories/Comidas', { method: 'DELETE' });
      const context = { params: Promise.resolve({ name: 'Comidas' }) };

      const response = await DELETE(request as NextRequest, context);
      
      expect(response.status).toBe(401);
      expect(mockDeleteCategory).not.toHaveBeenCalled();
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
      const context = { params: Promise.resolve({ name: 'Comidas' }) };
      
      const response = await PUT(request as NextRequest, context);
      const body = await response.json();

      // Verifica se usou o ID do catálogo correto
      expect(mockUpdateCategory).toHaveBeenCalledWith('Comidas', 'Pratos Quentes', MOCK_CATALOG_ID);
      expect(mockGetAllCategories).toHaveBeenCalledWith(MOCK_CATALOG_ID);
      expect(response.status).toBe(200);
      expect(body).toEqual([{ id: 'cat_1', name: 'Pratos Quentes' }]);
    });

    it('🚫 deve retornar 401 se o utilizador não estiver logado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/categories/Comidas', { 
        method: 'PUT',
        body: JSON.stringify({ newName: 'Teste' })
      });
      const context = { params: Promise.resolve({ name: 'Comidas' }) };

      const response = await PUT(request as NextRequest, context);
      
      expect(response.status).toBe(401);
      expect(mockUpdateCategory).not.toHaveBeenCalled();
    });
  });
});