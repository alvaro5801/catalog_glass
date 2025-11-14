// src/app/admin/dashboard/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import DashboardPage from '../page';
import type { Product, Category } from '@prisma/client';

// --- 1. MOCKS DOS SERVIÇOS ---
jest.mock('@/domain/services/ProductService', () => {
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProducts: jest.fn(),
    })),
  };
});

jest.mock('@/domain/services/CategoryService', () => {
  return {
    CategoryService: jest.fn().mockImplementation(() => ({
      getAllCategories: jest.fn(),
    })),
  };
});

jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn(),
}));

jest.mock('@/domain/repositories/CategoryRepository', () => ({
  CategoryRepository: jest.fn(),
}));

// 2. MOCK DO AUTH HELPER
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
  getUserCatalogId: jest.fn(),
}));

// ✅ 3. NOVO: MOCK DO PRISMA (Necessário porque adicionámos a busca do slug)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    catalog: {
      findUnique: jest.fn(),
    },
  },
}));

// --- IMPORTAR MOCKS ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ProductService } = jest.requireMock('@/domain/services/ProductService');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { CategoryService } = jest.requireMock('@/domain/services/CategoryService');

import { getAuthenticatedUser, getUserCatalogId } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma'; // Importar a referência do prisma mockado

// --- DADOS DE TESTE ---
const mockProducts = [
  { id: '1', name: 'Copo A', categoryId: 'cat1', images: ['/img.jpg'] },
  { id: '2', name: 'Copo B', categoryId: 'cat2', images: [] },
] as Product[];

const mockCategories = [
  { id: 'cat1', name: 'Vidro' },
  { id: 'cat2', name: 'Cristal' },
] as Category[];

describe('DashboardPage', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();

    (ProductService as jest.Mock).mockImplementation(() => ({
      getProducts: jest.fn().mockResolvedValue(mockProducts),
    }));
    (CategoryService as jest.Mock).mockImplementation(() => ({
      getAllCategories: jest.fn().mockResolvedValue(mockCategories),
    }));

    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ email: 'admin@teste.com' });
    (getUserCatalogId as jest.Mock).mockResolvedValue('catalog_123');

    // ✅ Configurar o retorno do Prisma para o Slug
    (prisma.catalog.findUnique as jest.Mock).mockResolvedValue({ slug: 'minha-loja-teste' });
  });

  it('deve renderizar os cartões e a tabela com os dados retornados pelos serviços', async () => {
    const ui = await DashboardPage();
    render(ui);

    // Verificar Cartões de Estatísticas
    expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Total de Categorias')).toBeInTheDocument();

    const countElements = screen.getAllByText('2');
    expect(countElements.length).toBeGreaterThanOrEqual(2);

    // Verificar Tabela de Produtos Recentes
    expect(screen.getByText('Copo A')).toBeInTheDocument();
    expect(screen.getByText('Vidro')).toBeInTheDocument();
    
    // ✅ Verificar se o link para a loja foi gerado corretamente
    const storeLink = screen.getByRole('link', { name: /Ver o meu Catálogo/i });
    expect(storeLink).toHaveAttribute('href', '/minha-loja-teste');
  });

  it('deve exibir "0" nos cartões se não houver dados', async () => {
    (ProductService as jest.Mock).mockImplementation(() => ({
      getProducts: jest.fn().mockResolvedValue([]),
    }));
    (CategoryService as jest.Mock).mockImplementation(() => ({
      getAllCategories: jest.fn().mockResolvedValue([]),
    }));

    const ui = await DashboardPage();
    render(ui);

    // Pode haver vários '0' na página, verifica se pelo menos 2 (dos cartões) existem
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2); 
    expect(screen.getByText(/Ainda não tem produtos/i)).toBeInTheDocument();
  });
});