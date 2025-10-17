// src/components/__tests__/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../product-card';
import { FavoritesProvider } from '@/contexts/favorites-context';
import type { Product } from '@/lib/types'; // Importar nosso tipo

// --- Simulação do localStorage (sem alterações) ---
let mockLocalStorage: { [key: string]: string } = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    clear: () => { mockLocalStorage = {}; }
  },
  writable: true,
});

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

describe('ProductCard Component (com Contexto)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ✅ ALTERAÇÃO: Criar um produto de teste local
  const product: Product = {
    id: 'prod_test_123',
    slug: 'produto-de-teste',
    name: 'Produto de Teste',
    images: ['/image1.jpg'],
    category: 'Testes',
    // Adicionar as propriedades que faltam para o tipo ser válido
    shortDescription: '',
    description: '',
    specifications: { material: '', capacidade: '', dimensoes: '' },
    priceTable: [],
    priceInfo: '',
  };

  it('deve exibir o coração vazio se o produto não for um favorito', () => {
    renderWithProvider(<ProductCard product={product} />);
    const favoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    const heartIcon = favoriteButton.querySelector('svg');
    expect(heartIcon).not.toHaveClass('fill-red-500');
  });

  it('deve exibir o coração preenchido se o produto for um favorito', () => {
    localStorage.setItem('favoriteProducts', JSON.stringify([product.id]));
    renderWithProvider(<ProductCard product={product} />);
    const favoriteButton = screen.getByLabelText(/Remover dos favoritos/i);
    const heartIcon = favoriteButton.querySelector('svg');
    expect(heartIcon).toHaveClass('fill-red-500');
  });

  it('deve alternar o estado de favorito ao clicar no botão', () => {
    renderWithProvider(<ProductCard product={product} />);
    const favoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    fireEvent.click(favoriteButton);
    const unfavoriteButton = screen.getByLabelText(/Remover dos favoritos/i);
    expect(unfavoriteButton.querySelector('svg')).toHaveClass('fill-red-500');
    fireEvent.click(unfavoriteButton);
    const newFavoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    expect(newFavoriteButton.querySelector('svg')).not.toHaveClass('fill-red-500');
  });
});