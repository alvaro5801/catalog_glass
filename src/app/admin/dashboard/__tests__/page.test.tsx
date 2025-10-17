// src/app/admin/dashboard/__tests__/page.test.tsx
// ✅ CORREÇÃO: A importação do React foi removida porque não estava a ser utilizada.
import { render, screen } from '@testing-library/react';
import DashboardPage from '../page';

// Simular os nossos serviços de domínio
const mockGetProducts = jest.fn();
const mockGetCategories = jest.fn();

jest.mock('@/domain/services/ProductService', () => {
  return {
    ProductService: jest.fn().mockImplementation(() => {
      return { getProducts: mockGetProducts };
    }),
  };
});

jest.mock('@/domain/services/CategoryService', () => {
  return {
    CategoryService: jest.fn().mockImplementation(() => {
      return { getAllCategories: mockGetCategories };
    }),
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    mockGetProducts.mockClear();
    mockGetCategories.mockClear();
  });

  it('deve renderizar os cartões e a tabela com os dados retornados pelos serviços', async () => {
    const mockProducts = [
      { id: '1', name: 'Produto Recente 1', categoryId: 'cat1', images: ['/img1.jpg'], isFeatured: false },
      { id: '2', name: 'Produto Recente 2', categoryId: 'cat2', images: ['/img2.jpg'], isFeatured: true },
    ];
    const mockCategories = [
      { id: 'cat1', name: 'Copos' },
      { id: 'cat2', name: 'Taças' },
      { id: 'cat3', name: 'Canecas' },
    ];

    mockGetProducts.mockResolvedValue(mockProducts);
    mockGetCategories.mockResolvedValue(mockCategories);

    const resolvedComponent = await DashboardPage();
    render(resolvedComponent);

    // Verificar os cartões de totais
    expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
    expect(screen.getByText(mockProducts.length.toString())).toBeInTheDocument();

    expect(screen.getByText('Total de Categorias')).toBeInTheDocument();
    expect(screen.getByText(mockCategories.length.toString())).toBeInTheDocument();

    // Verificar a tabela de produtos recentes
    expect(screen.getByText('Produtos Adicionados Recentemente')).toBeInTheDocument();
    expect(screen.getByText('Produto Recente 1')).toBeInTheDocument();
    expect(screen.getByText('Produto Recente 2')).toBeInTheDocument();

    expect(screen.getByText('Copos')).toBeInTheDocument();
    expect(screen.getByText('Taças')).toBeInTheDocument();
  });

  it('deve exibir "0" nos cartões se não houver dados', async () => {
    mockGetProducts.mockResolvedValue([]);
    mockGetCategories.mockResolvedValue([]);

    const resolvedComponent = await DashboardPage();
    render(resolvedComponent);

    expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Total de Categorias')).toBeInTheDocument();

    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(2);
  });
});