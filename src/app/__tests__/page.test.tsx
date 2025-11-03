// src/app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
// Importar Home aqui é normal, mas vamos recarregar dinamicamente no teste específico
import Home from '../page';
// Importar os produtos reais é necessário para o primeiro teste
// import { products } from '@/data/products'; // Removido import global, importaremos dinamicamente

// Mocks de UI, Contextos, React Hooks, Framer Motion (Mantêm-se iguais)
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-item">{children}</div>,
  CarouselNext: () => <button>Next</button>,
  CarouselPrevious: () => <button>Previous</button>,
}));
jest.mock('../page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});
jest.mock('../../contexts/favorites-context', () => ({ // Usando caminho relativo
  FavoritesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFavorites: () => ({ favorites: [], toggleFavorite: jest.fn() }),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => ({ current: null })),
}));
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useScroll: jest.fn(() => ({ scrollYProgress: { get: () => 0, onChange: () => {} } })),
  useTransform: jest.fn((value, transform) => {
    if (typeof transform === 'function') return { get: () => '0%', onChange: () => {} };
    const outputValue = (transform && Array.isArray(transform) && transform.length > 1 && Array.isArray(transform[1]) && transform[1].length > 0)
        ? transform[1][0]
        : '0%';
    return { get: () => outputValue, onChange: () => {} };
  }),
  motion: {
      div: jest.fn(({ children, style, ...rest }) => <div {...rest}>{children}</div>)
  }
}));

// Mock do 'next/link' (Mantém-se)
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: { href: string, children: React.ReactNode }) => {
    // Renderiza como uma tag <a> simples para que 'getByRole('link')' funcione
    return <a href={href}>{children}</a>;
  };
});

// ✅ --- NOVA CORREÇÃO AQUI ---
// Adicionamos a simulação do 'next/image'
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Renderiza como uma tag <img> simples, removendo a complexidade do Next.js
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));
// --- FIM DA CORREÇÃO ---


describe('Home Page (Server Component)', () => {
  beforeEach(() => {
    // Limpar mocks do React/Framer-motion
    (React.useRef as jest.Mock).mockClear();
    (jest.requireMock('framer-motion').useScroll as jest.Mock).mockClear();
    (jest.requireMock('framer-motion').useTransform as jest.Mock).mockClear();
    // Resetar módulos para permitir que jest.doMock funcione isoladamente
    jest.resetModules();
  });

  it('deve renderizar os elementos principais usando os dados reais', async () => {
    // Re-importar 'products' aqui para garantir que pegamos a versão não mockada após resetModules
    const { products: actualProducts } = await import('@/data/products');
    // Re-importar 'Home' para garantir que usa a versão não mockada dos produtos
    const CurrentHome = (await import('../page')).default;

    const resolvedComponent = await CurrentHome();
    render(resolvedComponent);

    // Verificações principais (mantêm-se)
    expect(screen.getByRole('heading', { level: 1, name: /Transforme Momentos em Memórias/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar Catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Personalize em Apenas 3 Passos/i })).toBeInTheDocument();

    // Verificações dos produtos e categorias (mantêm-se, usando actualProducts)
    const featuredProductsFromData = actualProducts.slice(0, 8);
    if (featuredProductsFromData.length > 0) {
        expect(screen.getByRole('heading', { name: /Os Mais Pedidos/i })).toBeInTheDocument();
        expect(screen.getByText(actualProducts[0].name)).toBeInTheDocument();
    } else {
        expect(screen.queryByRole('heading', { name: /Os Mais Pedidos/i })).not.toBeInTheDocument();
    }

    // --- ✅ CORREÇÃO APLICADA AQUI ---
    // 1. Criar o Set
    const uniqueCategories = new Set(actualProducts.map((product: any) => product.category));
    // 2. Converter para Array usando Array.from()
    const categoriesFromData = Array.from(uniqueCategories);
    // ---------------------------------

    expect(screen.getByRole('heading', { name: /Navegue por Categoria/i })).toBeInTheDocument();
    categoriesFromData.forEach(categoryName => {
        // A busca por RegExp continua válida
        expect(screen.getByRole('link', { name: new RegExp(categoryName, 'i') })).toBeInTheDocument();
    });
  });

  it('não deve renderizar a secção de destaques se nenhum produto for destacado (usando dados reais)', async () => {
    // Mockar os dados ANTES de importar o componente dentro do teste
    jest.doMock('@/data/products', () => ({
        __esModule: true,
        products: []
    }));

    // Importar/Recarregar o componente Home AQUI, DEPOIS do doMock
    const HomeWithEmptyData = (await import('../page')).default;

    const resolvedComponent = await HomeWithEmptyData();
    render(resolvedComponent);

    // A expectativa continua a mesma
    expect(screen.queryByRole('heading', { name: /Os Mais Pedidos/i })).not.toBeInTheDocument();

    // jest.unmock('@/data/products'); // O resetModules no beforeEach já cuida disso
  });

});