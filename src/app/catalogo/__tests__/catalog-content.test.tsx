// src/app/catalogo/__tests__/catalog-content.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogContent } from '../catalog-content';
import { FavoritesProvider } from '@/contexts/favorites-context'; 

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => '' }),
}));

// Função auxiliar para renderizar com contexto
const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

// --- Mocks de API ---
const mockApiProducts = [
  { 
    id: 'prod_1', 
    name: 'Copo de Teste', 
    categoryId: 'cat_1', 
    images: ['/copo.jpg'], 
    specifications: null, 
    priceTable: [],
    slug: 'copo-de-teste', 
    shortDescription: '',  
    description: '',       
    priceInfo: '',         
    isFeatured: false      
  },
  { 
    id: 'prod_2', 
    name: 'Taça de Teste', 
    categoryId: 'cat_2', 
    images: ['/taca.jpg'], 
    specifications: null, 
    priceTable: [],
    slug: 'taca-de-teste', 
    shortDescription: '',  
    description: '',       
    priceInfo: '',         
    isFeatured: false      
  }
];

const mockApiCategories = [
  { id: 'cat_1', name: 'Copos', catalogId: 'c123' },
  { id: 'cat_2', name: 'Taças', catalogId: 'c123' }
];
// --- Fim dos Mocks ---

describe('CatalogContent Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('deve exibir os produtos retornados pela API', async () => {
    const singleProduct = [mockApiProducts[0]];
    const singleCategory = [mockApiCategories[0]];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => singleProduct })
      .mockResolvedValueOnce({ ok: true, json: async () => singleCategory });

    renderWithProvider(<CatalogContent />);

    expect(await screen.findByText('Copo de Teste')).toBeInTheDocument();
    expect(screen.queryByText(/A carregar catálogo.../i)).not.toBeInTheDocument();
  });

  it('deve filtrar os produtos ao clicar numa categoria', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiCategories });

    renderWithProvider(<CatalogContent />);

    // Espera os produtos aparecerem
    expect(await screen.findByText('Copo de Teste')).toBeInTheDocument();
    expect(await screen.findByText('Taça de Teste')).toBeInTheDocument();

    // Clica na categoria "Taças"
    const categoryButton = await screen.findByRole('button', { name: /Taças/i });
    fireEvent.click(categoryButton);

    // Aguarda o re-render após o filtro
    await waitFor(() => {
      expect(screen.queryByText(/Copo de Teste/i)).not.toBeInTheDocument();
    });

    // Verifica se o produto da categoria Taças continua visível
    expect(screen.getByText(/Taça de Teste/i)).toBeInTheDocument();
  });
});
