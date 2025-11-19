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
jest.mock('@/components/product-card', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="mock-product-card">{product.name}</div>
  )
}));

// 4. Simular o 'Carousel'
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
    Coffee: () => <svg data-testid="icon-caneca" />, // Adicionei Caneca caso necessário
    Heart: () => <svg data-testid="icon-heart" />, // Adicionei Heart para os favoritos
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
    priceTable: [], priceInfo: 'info', isFeatured: true
  },
  {
    id: 'p2', name: 'Taça de Destaque 2', slug: 'taca-2', images: ['/img2.jpg'], category: 'Taças',
    shortDescription: 'desc', description: 'desc long', 
    specifications: { material: 'Vidro', capacidade: '500ml', dimensoes: '15cm' }, 
    priceTable: [], priceInfo: 'info', isFeatured: true
  }
];

// --- OS TESTES ---

describe('HomeContent Component', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar o conteúdo estático (Hero, Como Funciona)', () => {
    // ✅ CORREÇÃO: Passamos allProducts como array vazio
    renderWithProvider(<HomeContent featuredProducts={[]} allProducts={[]} allCategories={[]} />);

    // Verifica Hero
    expect(screen.getByRole('heading', { name: /Transforme Momentos em Memórias/i })).toBeInTheDocument();
    // Verifica Como Funciona
    expect(screen.getByRole('heading', { name: /Personalize em Apenas 3 Passos/i })).toBeInTheDocument();
  });

  it('deve renderizar os produtos em destaque e as categorias recebidos via props', () => {
    renderWithProvider(
      <HomeContent 
        featuredProducts={mockFeaturedProducts} 
        allProducts={mockFeaturedProducts} // ✅ CORREÇÃO: Passamos a lista completa
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
        featuredProducts={[]} // Lista de destaques vazia
        allProducts={mockFeaturedProducts} // A lista geral pode ter produtos, mas não importa se não houver destaques
        allCategories={mockCategories} 
      />
    );

    // Verifica se o título da secção NÃO existe
    expect(screen.queryByRole('heading', { name: /Produtos em Destaque/i })).not.toBeInTheDocument();
    
    // Verifica se NENHUM item de carrossel foi renderizado
    expect(screen.queryByTestId('mock-carousel-item')).not.toBeInTheDocument();
  });

  // ✅ NOVO TESTE: Verificar se a secção de Favoritos aparece
  it('deve exibir a secção "Os Seus Favoritos" quando existem favoritos salvos no localStorage', () => {
    // 1. Configurar o localStorage com um ID de favorito ('p1')
    localStorage.setItem('favoriteProducts', JSON.stringify(['p1']));

    renderWithProvider(
      <HomeContent 
        featuredProducts={[]} 
        allProducts={mockFeaturedProducts} // A lista completa onde ele vai procurar o 'p1'
        allCategories={mockCategories} 
      />
    );

    // 2. Verificar se a secção apareceu
    expect(screen.getByRole('heading', { name: /Os Seus Favoritos/i })).toBeInTheDocument();
    
    // 3. Verificar se APENAS o produto favorito ('p1') está visível nessa secção
    // Nota: Como 'featuredProducts' está vazio, se o 'Copo de Destaque 1' aparecer, só pode ser na secção de favoritos.
    expect(screen.getByText('Copo de Destaque 1')).toBeInTheDocument();
    
    // O produto 'p2' (Taça) não está nos favoritos, não deve aparecer
    expect(screen.queryByText('Taça de Destaque 2')).not.toBeInTheDocument();
  });

});