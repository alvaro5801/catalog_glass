// src/app/catalogo/__tests__/catalog-content.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogContent } from '../catalog-content';
import { products } from '@/data/products';

// Mock do 'useSearchParams' do Next.js, pois ele não funciona fora de um contexto de navegação
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => '',
  }),
}));

describe('CatalogContent Component', () => {

  it('deve exibir todos os produtos inicialmente', () => {
    render(<CatalogContent />);
    // Verifica se o número de cards de produtos na tela é igual ao total de produtos
    const productCards = screen.getAllByRole('link', { name: /Valores/i });
    expect(productCards).toHaveLength(products.length);
  });
  
  it('deve filtrar os produtos ao clicar numa categoria', () => {
    render(<CatalogContent />);
    
    // 1. Encontra e clica no botão da categoria "Taças"
    const categoryButton = screen.getByRole('button', { name: /Taças/i });
    fireEvent.click(categoryButton);

    // 2. Conta quantos produtos da categoria "Taças" existem nos seus dados
    const tacasProductsCount = products.filter(p => p.category === 'Taças').length;

    // 3. Verifica se o número de produtos exibidos na tela agora é igual a 'tacasProductsCount'
    const productCards = screen.getAllByRole('link', { name: /Valores/i });
    expect(productCards).toHaveLength(tacasProductsCount);

    // 4. (Opcional) Garante que um produto de outra categoria NÃO está visível
    const copoElement = screen.queryByText(/Copo Long Drink/i);
    expect(copoElement).not.toBeInTheDocument();
  });

});