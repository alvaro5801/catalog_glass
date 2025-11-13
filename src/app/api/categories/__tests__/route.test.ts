// src/app/api/categories/__tests__/route.test.ts
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importamos o prisma real para o mockar
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// --- 1. MOCKS ---

// Mock do Prisma (Simular a base de dados)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(), // Necessário para a verificação de duplicados
    },
  },
}));

// Mock do Auth Helper
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// --- 2. DADOS DE TESTE ---
const MOCK_USER_CATALOG_ID = 'catalog_user_secure_123';
// Usamos toISOString() para garantir que o formato bate certo com o JSON serializado
const fixedDate = new Date('2024-01-01T00:00:00Z');
const fixedDateString = fixedDate.toISOString(); 

const mockCategories = [
  { 
    id: 'cat_1', 
    name: 'Copos', 
    catalogId: MOCK_USER_CATALOG_ID,
    createdAt: fixedDate,
    updatedAt: fixedDate
  },
  { 
    id: 'cat_2', 
    name: 'Taças', 
    catalogId: MOCK_USER_CATALOG_ID,
    createdAt: fixedDate,
    updatedAt: fixedDate
  },
];

describe('API Route: /api/categories', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes GET ---
  describe('GET', () => {
    it('deve retornar a lista de categorias do utilizador logado (200)', async () => {
      // Preparação
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);
      
      // O Prisma deve retornar os dados mockados
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      // Execução
      const response = await GET();
      const body = await response.json();

      // Verificação
      expect(response.status).toBe(200);
      
      // Precisamos comparar com as datas em string, pois o JSON serializa
      const expectedBody = mockCategories.map(c => ({
          ...c,
          createdAt: fixedDateString,
          updatedAt: fixedDateString
      }));
      
      expect(body).toEqual(expectedBody);
      expect(getUserCatalogId).toHaveBeenCalledWith('teste@admin.com');
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { catalogId: MOCK_USER_CATALOG_ID },
        orderBy: { name: 'asc' },
      });
    });

    it('deve retornar um erro 500 se o Prisma falhar', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);
      
      // Simular erro no banco
      (prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toMatch(/Erro interno/);
    });
  });

  // --- Testes POST ---
  describe('POST', () => {
    
    it('🚫 deve retornar 401 se o utilizador NÃO estiver logado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Nova' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toMatch(/Não autorizado/);
      expect(prisma.category.create).not.toHaveBeenCalled();
    });

    it('✅ deve criar uma nova categoria para o catálogo do utilizador (201)', async () => {
      const newCategory = { 
        id: 'cat_3', 
        name: 'Canecas', 
        catalogId: MOCK_USER_CATALOG_ID,
        createdAt: fixedDate,
        updatedAt: fixedDate
      };

      // Preparação
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);
      
      // IMPORTANTE: Mockar que NÃO existe duplicado (retorna null)
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mockar a criação
      (prisma.category.create as jest.Mock).mockResolvedValue(newCategory);

      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Canecas' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual({
          ...newCategory,
          createdAt: fixedDateString,
          updatedAt: fixedDateString
      });
      
      // Verificar se passou o ID correto do catálogo
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
            name: 'Canecas',
            catalogId: MOCK_USER_CATALOG_ID
        }
      });
    });

    it('deve retornar 400 se o nome for muito curto', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
      
      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'A' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      // ✅ Correção: Texto exato da nova API
      expect(body.error).toBe("O nome deve ter pelo menos 2 caracteres.");
    });

    it('deve retornar 409 se a categoria já existir (Duplicado)', async () => {
        (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'teste@admin.com' });
        (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_USER_CATALOG_ID);

        // Simular que JÁ EXISTE uma categoria
        (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 'existing_1' });

        const request = new NextRequest('http://localhost/api/categories', {
            method: 'POST',
            body: JSON.stringify({ name: 'Duplicada' }),
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toMatch(/já existe/);
        expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });
});