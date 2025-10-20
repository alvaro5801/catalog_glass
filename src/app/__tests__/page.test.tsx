// src/app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page'; // Importa a tua página inicial
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from '@prisma/client';

// 1. Simular os Serviços
const mockGetProducts = jest.fn();
const mockGetCategories = jest.fn();

jest.mock('@/domain/services/ProductService', () => {
  return {
    ProductService: jest.fn().mockImplementation(() => {
      // Retornar apenas as funções usadas pela página Home
      return { getProducts: mockGetProducts };
    }),
  };
});
// Mock do Repository (dependência interna do Serviço, precisa existir)
jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn().mockImplementation(() => {}),
}));


jest.mock('@/domain/services/CategoryService', () => {
  return {
    CategoryService: jest.fn().mockImplementation(() => {
      // Retornar apenas as funções usadas pela página Home
      return { getAllCategories: mockGetCategories };
    }),
  };
});
// Mock do Repository (dependência interna do Serviço, precisa existir)
jest.mock('@/domain/repositories/CategoryRepository', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => {}),
}));

// ✅ NOVO: Simular os componentes do Carrossel
// Vamos substituir os componentes complexos por divs simples
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-item">{children}</div>,
  CarouselNext: () => <button>Next</button>, // Placeholder simples
  CarouselPrevious: () => <button>Previous</button>, // Placeholder simples
}));


// Simular o componente PageLayout para simplificar o teste
jest.mock('../page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

// Simular o componente FavoritesProvider (necessário porque ProductCard o usa)
jest.mock('@/contexts/favorites-context', () => ({
  FavoritesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFavorites: () => ({ favorites: [], toggleFavorite: jest.fn() }),
}));


// 2. Dados de Teste
const mockProducts: (PrismaProduct & { specifications: Specification | null; priceTable: PriceTier[] })[] = [
  { id: 'prod_1', name: 'Copo Destaque 1', slug: 'copo-destaque-1', categoryId: 'cat_1', images: ['/img1.jpg'], isFeatured: true, shortDescription: '', description: '', priceInfo: '', catalogId: 'mock_catalog', specifications: null, priceTable: [] },
  { id: 'prod_2', name: 'Copo Normal 2', slug: 'copo-normal-2', categoryId: 'cat_1', images: ['/img2.jpg'], isFeatured: false, shortDescription: '', description: '', priceInfo: '', catalogId: 'mock_catalog', specifications: null, priceTable: [] },
  { id: 'prod_3', name: 'Taça Destaque 3', slug: 'taca-destaque-3', categoryId: 'cat_2', images: ['/img3.jpg'], isFeatured: true, shortDescription: '', description: '', priceInfo: '', catalogId: 'mock_catalog', specifications: null, priceTable: [] },
];

const mockCategories: PrismaCategory[] = [
  { id: 'cat_1', name: 'Copos', catalogId: 'mock_catalog' },
  { id: 'cat_2', name: 'Taças', catalogId: 'mock_catalog' },
];

describe('Home Page (Server Component)', () => {

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    mockGetProducts.mockClear();
    mockGetCategories.mockClear();
  });

  it('deve renderizar os elementos principais e buscar dados dos serviços', async () => {
    // Preparação: Definir o que os mocks vão retornar
    mockGetProducts.mockResolvedValue(mockProducts);
    mockGetCategories.mockResolvedValue(mockCategories);

    // Execução: Renderizar o Server Component (ele vai chamar os mocks)
    // Server Components retornam uma Promise, então usamos 'await'
    const resolvedComponent = await Home();
    render(resolvedComponent);

    // Verificação:
    // 1. Serviços foram chamados?
    expect(mockGetProducts).toHaveBeenCalledTimes(1);
    expect(mockGetCategories).toHaveBeenCalledTimes(1);

    // 2. Elementos principais estão na página?
    expect(screen.getByRole('heading', { level: 1, name: /Transforme Momentos em Memórias/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar Catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Personalize em Apenas 3 Passos/i })).toBeInTheDocument();

    // 3. Produtos em destaque estão no carrossel? (Verificar pelos nomes)
    // Agora que o carrossel está mockado, os itens ainda devem ser renderizados dentro dele.
    expect(screen.getByRole('heading', { name: /Produtos em Destaque/i })).toBeInTheDocument();
    expect(screen.getByText('Copo Destaque 1')).toBeInTheDocument();
    expect(screen.getByText('Taça Destaque 3')).toBeInTheDocument();
    // Garante que o produto não destacado NÃO está na secção de destaques (esta verificação pode falhar se o mock não isolar bem, mas vamos tentar)
    // Se esta linha falhar, podemos removê-la, pois o mais importante é verificar se os destaques *estão* lá.
    expect(screen.queryByText('Copo Normal 2')).not.toBeInTheDocument();

    // 4. Categorias estão a ser exibidas? (Verificar pelos links)
    expect(screen.getByRole('heading', { name: /Navegue por Categoria/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Copos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Taças/i })).toBeInTheDocument();
  });

   it('não deve renderizar a secção de destaques se nenhum produto for destacado', async () => {
    // Preparação: Nenhum produto com isFeatured = true
    const noFeaturedProducts = mockProducts.map(p => ({ ...p, isFeatured: false }));
    mockGetProducts.mockResolvedValue(noFeaturedProducts);
    mockGetCategories.mockResolvedValue(mockCategories);

    // Execução:
    const resolvedComponent = await Home();
    render(resolvedComponent);

    // Verificação:
    expect(screen.queryByRole('heading', { name: /Produtos em Destaque/i })).not.toBeInTheDocument();
  });

});