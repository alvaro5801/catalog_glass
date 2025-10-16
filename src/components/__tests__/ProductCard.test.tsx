import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../product-card';
import { products } from '@/data/products';
import { FavoritesProvider } from '@/contexts/favorites-context'; // 1. Importar o Provedor

// Simulação do localStorage para controlar o estado inicial
let mockLocalStorage: { [key: string]: string } = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    clear: () => { mockLocalStorage = {}; }
  },
  writable: true,
});

// Simular o componente Link do Next.js (continua igual)
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Helper para renderizar componentes dentro do Provedor
const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

describe('ProductCard Component (com Contexto)', () => {

  beforeEach(() => {
    localStorage.clear(); // Limpa o estado antes de cada teste
  });

  const product = products[0];

  it('deve exibir o coração vazio se o produto não for um favorito', () => {
    renderWithProvider(<ProductCard product={product} />);

    const favoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    const heartIcon = favoriteButton.querySelector('svg');

    expect(heartIcon).not.toHaveClass('fill-red-500');
  });

  it('deve exibir o coração preenchido se o produto for um favorito', () => {
    // Define o estado inicial como se o produto já estivesse favoritado
    localStorage.setItem('favoriteProducts', JSON.stringify([product.id]));

    renderWithProvider(<ProductCard product={product} />);

    const favoriteButton = screen.getByLabelText(/Remover dos favoritos/i);
    const heartIcon = favoriteButton.querySelector('svg');

    expect(heartIcon).toHaveClass('fill-red-500');
  });

  it('deve alternar o estado de favorito ao clicar no botão', () => {
    renderWithProvider(<ProductCard product={product} />);

    // 1. Clica para favoritar
    const favoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    fireEvent.click(favoriteButton);

    // 2. Verifica se o ícone e o texto mudaram
    const unfavoriteButton = screen.getByLabelText(/Remover dos favoritos/i);
    expect(unfavoriteButton.querySelector('svg')).toHaveClass('fill-red-500');

    // 3. Clica para desfavoritar
    fireEvent.click(unfavoriteButton);

    // 4. Verifica se voltou ao estado original
    const newFavoriteButton = screen.getByLabelText(/Adicionar aos favoritos/i);
    expect(newFavoriteButton.querySelector('svg')).not.toHaveClass('fill-red-500');
  });
});
