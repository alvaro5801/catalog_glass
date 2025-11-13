// ARQUIVO: src/app/api/products/__tests__/route.test.ts

// Mock do setImmediate para ambientes que precisam dele
global.setImmediate = jest.fn() as unknown as typeof setImmediate;

import { GET, POST } from '../route'; // Importa as funções do passo 1
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';

// 1. Mocks (Simulações)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// 2. Dados de Teste
const MOCK_CATALOG_ID = 'catalog_123';
const mockProduct = {
  id: 'prod_1',
  name: 'Copo Teste',
  catalogId: MOCK_CATALOG_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API Route: /api/products', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar 200 e a lista de produtos', async () => {
      // Configurar mocks
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);

      // Executar
      const response = await GET();
      const body = await response.json();

      // Verificar
      expect(response.status).toBe(200);
      // JSON.parse(JSON.stringify(...)) ajuda a ignorar diferenças de formato de Data
      expect(body).toEqual(JSON.parse(JSON.stringify([mockProduct])));
    });
  });

  describe('POST', () => {
    it('deve retornar 201 ao criar produto com sucesso', async () => {
      // Configurar mocks
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      // Criar requisição falsa
      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Copo Teste',
          price: 10,
          categoryId: 'cat_1'
        }),
      });

      // Executar
      const response = await POST(req);
      const body = await response.json();

      // Verificar
      expect(response.status).toBe(201);
      expect(body).toEqual(JSON.parse(JSON.stringify(mockProduct)));
    });

    it('deve retornar 401 se não estiver logado', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Teste' }),
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
    });
  });
});