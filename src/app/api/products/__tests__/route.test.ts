// ARQUIVO: src/app/api/products/__tests__/route.test.ts

// Mock do setImmediate para ambientes que precisam dele
global.setImmediate = jest.fn() as unknown as typeof setImmediate;

import { GET, POST } from '../route';
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

const requestBody = {
  name: 'Novo Copo',
  price: 10, 
  categoryId: 'cat_1',
};

describe('API Route: /api/products', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar 200 e a lista de produtos', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(JSON.parse(JSON.stringify([mockProduct])));
    });
  });

  describe('POST', () => {
    it('✅ deve criar produto se autenticado, injetando o catalogId correto', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual(JSON.parse(JSON.stringify(mockProduct)));

      // ✅ VERIFICAÇÃO REFORÇADA: Garantimos que o 'include' foi enviado
      expect(prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          name: 'Novo Copo',
          catalogId: MOCK_CATALOG_ID 
        }),
        include: {
            category: true,
            priceTable: true,
            specifications: true,
        }
      }));
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

    it('✅ deve gerar um slug automaticamente se não for enviado no body', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
      (getUserCatalogId as jest.Mock).mockResolvedValue(MOCK_CATALOG_ID);
      
      const generatedSlug = 'produto-sem-slug-abc12';
      const mockCreatedProduct = { ...mockProduct, slug: generatedSlug };
      (prisma.product.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

      const req = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Produto Sem Slug',
          price: 10,
          categoryId: 'cat_1'
        }),
      });

      const response = await POST(req);
      
      expect(response.status).toBe(201);

      // Verifica se o slug foi gerado e se o include também foi passado aqui
      expect(prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          name: 'Produto Sem Slug',
          slug: expect.stringMatching(/^produto-sem-slug-/), 
        }),
        include: {
            category: true,
            priceTable: true,
            specifications: true,
        }
      }));
    });
  });
});