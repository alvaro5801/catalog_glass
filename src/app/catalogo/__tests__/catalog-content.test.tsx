// src/app/catalogo/__tests__/catalog-content.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogContent } from '../catalog-content';
import { products } from '@/data/products';
import { FavoritesProvider } from '@/contexts/favorites-context'; // 1. Importar o Provedor

// Mock do 'useSearchParams' do Next.js
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => '',
  }),
}));

// Função auxiliar para renderizar com o provedor
const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

describe('CatalogContent Component', () => {

  it('deve exibir todos os produtos inicialmente', () => {
    // 2. Usar a função auxiliar para renderizar
    renderWithProvider(<CatalogContent />);

    const productCards = screen.getAllByRole('link', { name: /Valores/i });
    expect(productCards).toHaveLength(products.length);
  });

  it('deve filtrar os produtos ao clicar numa categoria', () => {
    // 3. Usar a função auxiliar aqui também
    renderWithProvider(<CatalogContent />);

    const categoryButton = screen.getByRole('button', { name: /Taças/i });
    fireEvent.click(categoryButton);

    const tacasProductsCount = products.filter(p => p.category === 'Taças').length;
    const productCards = screen.getAllByRole('link', { name: /Valores/i });
    expect(productCards).toHaveLength(tacasProductsCount);

    const copoElement = screen.queryByText(/Copo Long Drink/i);
    expect(copoElement).not.toBeInTheDocument();
  });

});