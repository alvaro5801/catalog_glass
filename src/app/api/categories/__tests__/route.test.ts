// src/app/api/categories/__tests__/route.test.ts
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import type { Category } from '@prisma/client';

// ✅ CORREÇÃO 1: As funções de mock são criadas DENTRO do jest.mock
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
    // ✅ CORREÇÃO 2: Exportamos os mocks para o teste os poder aceder
    __mocks__: { mockGetAllCategories, mockAddNewCategory },
  };
});

// Mockar o CategoryRepository (como estava antes)
jest.mock('@/domain/repositories/CategoryRepository', () => {
  return {
    CategoryRepository: jest.fn().mockImplementation(() => {}),
  };
});

// ✅ CORREÇÃO 3: Usamos 'jest.requireMock' para obter uma referência segura aos mocks
const { __mocks__ } = jest.requireMock('@/domain/services/CategoryService');
const { mockGetAllCategories, mockAddNewCategory } = __mocks__;


// Dados de Teste (como estava antes)
const mockCategories: Category[] = [
  { id: 'cat_1', name: 'Copos', catalogId: 'catalog_123' },
  { id: 'cat_2', name: 'Taças', catalogId: 'catalog_123' },
];

describe('API Route: /api/categories', () => {

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    mockGetAllCategories.mockClear();
    mockAddNewCategory.mockClear();
  });

  // --- Testes para a função GET ---
  describe('GET', () => {
    it('deve retornar a lista de categorias e status 200', async () => {
      // Preparação: Simular a resposta do serviço
      mockGetAllCategories.mockResolvedValue(mockCategories);

      // Execução: Chamar a função GET da rota
      const response = await GET();
      const body = await response.json();

      // Verificação:
      expect(response.status).toBe(200);
      expect(body).toEqual(mockCategories);
      // Garante que o serviço foi chamado
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    });

    it('deve retornar um erro 500 se o serviço falhar', async () => {
      // Preparação: Simular um erro inesperado
      mockGetAllCategories.mockRejectedValue(new Error('Erro de base de dados'));

      // Execução:
      const response = await GET();
      const body = await response.json();

      // Verificação:
      expect(response.status).toBe(500);
      expect(body.error).toBe("Erro ao buscar categorias.");
      expect(body.details).toBe("Erro de base de dados");
    });
  });

  // --- Testes para a função POST ---
  describe('POST', () => {
    it('deve criar uma nova categoria e retornar 201', async () => {
      const newCategory = { id: 'cat_3', name: 'Canecas', catalogId: 'catalog_123' };
      const requestBody = { name: 'Canecas' };

      // Preparação:
      // 1. Simular a resposta do serviço
      mockAddNewCategory.mockResolvedValue(newCategory);
      // 2. Simular o objeto NextRequest
      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Execução:
      const response = await POST(request);
      const body = await response.json();

      // Verificação:
      expect(response.status).toBe(201);
      expect(body).toEqual(newCategory);
      // Garante que o serviço foi chamado com os dados corretos
      expect(mockAddNewCategory).toHaveBeenCalledWith('Canecas', expect.any(String)); // O MOCK_CATALOG_ID é usado
    });

    it('deve retornar 400 se a validação do serviço falhar (ex: nome curto)', async () => {
      const requestBody = { name: 'A' };

      // Preparação:
      // 1. Simular o erro de validação do serviço
      mockAddNewCategory.mockRejectedValue(new Error("O nome da categoria deve ter pelo menos 2 caracteres."));
      // 2. Simular o request
      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Execução:
      const response = await POST(request);
      const body = await response.json();

      // Verificação:
      // A rota deteta a palavra "caracteres" e retorna 400
      expect(response.status).toBe(400); 
      expect(body.error).toBe("O nome da categoria deve ter pelo menos 2 caracteres.");
    });
  });
});