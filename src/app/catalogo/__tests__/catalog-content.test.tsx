// src/app/catalogo/__tests__/catalog-content.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogContent } from '../catalog-content';
import { FavoritesProvider } from '@/contexts/favorites-context'; // O ProductCard precisa disto

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => '' }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

// --- MOCKS CORRIGIDOS ---
// A tua lógica de filtro (useMemo) agora depende dos IDs
const mockApiProducts = [
  // O 'specifications' e 'priceTable' são necessários para o 'formattedProducts'
  { id: 'prod_1', name: 'Copo de Teste', categoryId: 'cat_1', images: ['/copo.jpg'], specifications: null, priceTable: [] },
  { id: 'prod_2', name: 'Taça de Teste', categoryId: 'cat_2', images: ['/taca.jpg'], specifications: null, priceTable: [] }
];
const mockApiCategories = [
  { id: 'cat_1', name: 'Copos', catalogId: 'c123' },
  { id: 'cat_2', name: 'Taças', catalogId: 'c123' }
];
// --- FIM DOS MOCKS CORRIGIDOS ---


describe('CatalogContent Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('deve exibir os produtos retornados pela API', async () => {
    // Usar mocks que só têm um produto
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
    // Usar os mocks completos
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiCategories });

    renderWithProvider(<CatalogContent />);

    // Espera que ambos os produtos e botões estejam visíveis
    expect(await screen.findByText('Copo de Teste')).toBeInTheDocument();
    expect(await screen.findByText('Taça de Teste')).toBeInTheDocument();
    const categoryButton = await screen.findByRole('button', { name: /Taças/i });
    
    // Clica no botão "Taças"
    fireEvent.click(categoryButton);

    // Espera que o filtro (useMemo) seja aplicado
    await waitFor(() => {
      expect(screen.getByText(/Taça de Teste/i)).toBeInTheDocument();
      expect(screen.queryByText(/Copo de Teste/i)).not.toBeInTheDocument();
    });
  });
});