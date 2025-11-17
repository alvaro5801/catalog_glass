// src/app/__tests__/home-content.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HomeContent } from '../home-content'; // O componente que vamos testar
import { FavoritesProvider } from '@/contexts/favorites-context'; // Necessário para o ProductCard
import type { Product as CardProductType } from "@/lib/types";
import type { Category } from '@prisma/client';

// --- SIMULAÇÕES (MOCKS) ---

// 1. Simular o 'next/link'
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// 2. Simular o 'framer-motion' para evitar erros de animação
jest.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: (props: any) => <div {...props} /> 
  }
}));

// 3. Simular o 'ProductCard'
// ✅ CORREÇÃO AQUI: Usar o alias '@/'
jest.mock('@/components/product-card', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="mock-product-card">{product.name}</div>
  )
}));

// 4. Simular o 'Carousel'
// ✅ CORREÇÃO AQUI: Usar o alias '@/'
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-item">{children}</div>,
  CarouselPrevious: () => <button>Prev</button>,
  CarouselNext: () => <button>Next</button>,
}));

// 5. Simular os ícones (apenas os usados nas categorias)
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    GlassWater: () => <svg data-testid="icon-copo" />,
    Wine: () => <svg data-testid="icon-taca" />,
  };
});

// 6. Simular o localStorage (necessário para o FavoritesProvider)
let mockLocalStorage: { [key: string]: string } = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    clear: () => { mockLocalStorage = {}; }
  },
  writable: true,
});

// --- FUNÇÃO DE RENDERIZAÇÃO AUXILIAR ---
const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

// --- DADOS DE TESTE ---
const mockCategories: Category[] = [
  { id: 'c1', name: 'Copos', catalogId: 'cat123', createdAt: new Date(), updatedAt: new Date() },
  { id: 'c2', name: 'Taças', catalogId: 'cat123', createdAt: new Date(), updatedAt: new Date() }
];

const mockFeaturedProducts: CardProductType[] = [
  {
    id: 'p1', name: 'Copo de Destaque 1', slug: 'copo-1', images: ['/img1.jpg'], category: 'Copos',
    shortDescription: 'desc', description: 'desc long', 
    specifications: { material: 'Acrílico', capacidade: '300ml', dimensoes: '10cm' }, 
    priceTable: [], priceInfo: 'info',
  },
  {
    id: 'p2', name: 'Taça de Destaque 2', slug: 'taca-2', images: ['/img2.jpg'], category: 'Taças',
    shortDescription: 'desc', description: 'desc long', 
    specifications: { material: 'Vidro', capacidade: '500ml', dimensoes: '15cm' }, 
    priceTable: [], priceInfo: 'info',
  }
];

// --- OS TESTES ---

describe('HomeContent Component', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar o conteúdo estático (Hero, Como Funciona)', () => {
    renderWithProvider(<HomeContent featuredProducts={[]} allCategories={[]} />);

    // Verifica Hero
    expect(screen.getByRole('heading', { name: /Transforme Momentos em Memórias/i })).toBeInTheDocument();
    // Verifica Como Funciona
    expect(screen.getByRole('heading', { name: /Personalize em Apenas 3 Passos/i })).toBeInTheDocument();
  });

  it('deve renderizar os produtos em destaque e as categorias recebidos via props', () => {
    renderWithProvider(
      <HomeContent 
        featuredProducts={mockFeaturedProducts} 
        allCategories={mockCategories} 
      />
    );

    // 1. Verifica a secção "Produtos em Destaque"
    expect(screen.getByRole('heading', { name: /Produtos em Destaque/i })).toBeInTheDocument();
    
    // Verifica se os nossos ProductCards simulados estão na tela
    expect(screen.getByText('Copo de Destaque 1')).toBeInTheDocument();
    expect(screen.getByText('Taça de Destaque 2')).toBeInTheDocument();
    
    // Verifica se temos 2 itens no carrossel
    const carouselItems = screen.getAllByTestId('mock-carousel-item');
    expect(carouselItems).toHaveLength(2);

    // 2. Verifica a secção "Navegue por Categoria"
    expect(screen.getByRole('heading', { name: /Navegue por Categoria/i })).toBeInTheDocument();
    
    // Verifica se os links das categorias estão na tela
    const linkCopos = screen.getByRole('link', { name: /Copos/i });
    const linkTacas = screen.getByRole('link', { name: /Taças/i });
    
    expect(linkCopos).toBeInTheDocument();
    expect(linkTacas).toBeInTheDocument();
    expect(linkCopos).toHaveAttribute('href', '/catalogo?categoria=copos');

    // Verifica se os ícones corretos foram renderizados
    expect(screen.getByTestId('icon-copo')).toBeInTheDocument();
    expect(screen.getByTestId('icon-taca')).toBeInTheDocument();
  });

  it('NÃO deve renderizar a secção "Produtos em Destaque" se a lista estiver vazia', () => {
    renderWithProvider(
      <HomeContent 
        featuredProducts={[]} // Lista vazia
        allCategories={mockCategories} 
      />
    );

    // Verifica se o título da secção NÃO existe
    expect(screen.queryByRole('heading', { name: /Produtos em Destaque/i })).not.toBeInTheDocument();
    
    // Verifica se NENHUM item de carrossel foi renderizado
    expect(screen.queryByTestId('mock-carousel-item')).not.toBeInTheDocument();
  });

});