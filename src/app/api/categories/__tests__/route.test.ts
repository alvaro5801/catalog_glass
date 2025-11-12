// src/app/api/categories/__tests__/route.test.ts
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import type { Category } from '@prisma/client';

// --- 1. MOCKS DOS SERVIÇOS ---
jest.mock('@/domain/services/CategoryService', () => {
  const mockGetAllCategories = jest.fn();
  const mockAddNewCategory = jest.fn();

  return {
    CategoryService: jest.fn().mockImplementation(() => {
      return {
        getAllCategories: mockGetAllCategories,
        addNewCategory: mockAddNewCategory,
      };
    }),
    __mocks__: { mockGetAllCategories, mockAddNewCategory },
  };
});

// Mockar o CategoryRepository
jest.mock('@/domain/repositories/CategoryRepository', () => {
  return {
    CategoryRepository: jest.fn().mockImplementation(() => {}),
  };
});

// ✅ NOVO: Mockar o Auth Helper para simular login e catálogo
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// --- 2. REFERÊNCIAS AOS MOCKS ---
const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
const { mockGetAllCategories, mockAddNewCategory } = __mocks__;
// Importar as funções mockadas do auth-helper
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// --- 3. DADOS DE TESTE ---
const MOCK_USER_CATALOG_ID = 'catalog_user_secure_123';

const mockCategories: Category[] = [
  { id: 'cat_1', name: 'Copos', catalogId: MOCK_USER_CATALOG_ID },
  { id: 'cat_2', name: 'Taças', catalogId: MOCK_USER_CATALOG_ID },
];

describe('API Route: /api/categories', () => {

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes para a função GET ---
  describe('GET', () => {
    it('deve retornar a lista de categorias do utilizador logado (200)', async () => {
      // 1. Simular Utilizador Logado
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);

      // 2. Simular resposta do serviço
      mockGetAllCategories.mockResolvedValue(mockCategories);

      // Execução
      const response = await GET();
      const body = await response.json();

      // Verificação
      expect(response.status).toBe(200);
      expect(body).toEqual(mockCategories);
      
      // ✅ Verifica se buscou o ID correto do utilizador
      expect(getUserCatalogId).toHaveBeenCalledWith('teste@admin.com');
      expect(mockGetAllCategories).toHaveBeenCalledWith(MOCK_USER_CATALOG_ID);
    });

    it('deve retornar um erro 500 se o serviço falhar', async () => {
      // Simular login para passar a barreira de auth (ou mockar comportamento publico se aplicável)
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);
      
      // Simular erro
      mockGetAllCategories.mockRejectedValue(new Error('Erro de base de dados'));

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Erro ao buscar categorias.");
    });
  });

  // --- Testes para a função POST ---
  describe('POST', () => {
    
    it('🚫 deve retornar 401 se o utilizador NÃO estiver logado', async () => {
      // Simular sem sessão
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Nova Categoria' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toMatch(/Não autorizado/);
      expect(mockAddNewCategory).not.toHaveBeenCalled(); // Nada criado
    });

    it('✅ deve criar uma nova categoria para o catálogo do utilizador (201)', async () => {
      const newCategory = { id: 'cat_3', name: 'Canecas', catalogId: MOCK_USER_CATALOG_ID };
      const requestBody = { name: 'Canecas' };

      // Preparação:
      // 1. Autenticação Mockada
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);

      // 2. Serviço Mockado
      mockAddNewCategory.mockResolvedValue(newCategory);

      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Execução
      const response = await POST(request);
      const body = await response.json();

      // Verificação
      expect(response.status).toBe(201);
      expect(body).toEqual(newCategory);
      
      // ✅ CRÍTICO: Verificar se criou no catálogo do utilizador (e não no mock antigo)
      expect(mockAddNewCategory).toHaveBeenCalledWith('Canecas', MOCK_USER_CATALOG_ID);
    });

    it('deve retornar 400 se a validação do serviço falhar (ex: nome curto)', async () => {
      const requestBody = { name: 'A' };

      // Preparação:
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);
      
      mockAddNewCategory.mockRejectedValue(new Error("O nome da categoria deve ter pelo menos 2 caracteres."));

      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400); 
      expect(body.error).toBe("O nome da categoria deve ter pelo menos 2 caracteres.");
    });
  });
});