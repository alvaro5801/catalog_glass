// src/app/catalogo/__tests__/catalog-content.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogContent } from '../catalog-content';
import { FavoritesProvider } from '@/contexts/favorites-context';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => '' }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<FavoritesProvider>{component}</FavoritesProvider>);
};

describe('CatalogContent Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('deve exibir os produtos retornados pela API', async () => {
    // ✅ CORREÇÃO: Fornecer um caminho de imagem válido nos dados de teste.
    const mockProducts = [
      { id: 'prod_1', name: 'Produto da API 1', categoryId: 'Cat 1', images: ['/test-image.jpg'] }
    ];
    const mockCategories = [{ name: 'Cat 1' }];
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    renderWithProvider(<CatalogContent />);

    expect(await screen.findByText('Produto da API 1')).toBeInTheDocument();
    expect(screen.queryByText(/A carregar catálogo.../i)).not.toBeInTheDocument();
  });

  it('deve filtrar os produtos ao clicar numa categoria', async () => {
    // ✅ CORREÇÃO: Fazer o mesmo ajuste aqui.
    const mockProducts = [
      { id: 'prod_1', name: 'Copo de Teste', categoryId: 'Copos', images: ['/copo.jpg'] },
      { id: 'prod_2', name: 'Taça de Teste', categoryId: 'Taças', images: ['/taca.jpg'] }
    ];
    const mockCategories = [{ name: 'Copos' }, { name: 'Taças' }];
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    renderWithProvider(<CatalogContent />);

    const categoryButton = await screen.findByRole('button', { name: /Taças/i });
    fireEvent.click(categoryButton);

    await waitFor(() => {
      expect(screen.getByText(/Taça de Teste/i)).toBeInTheDocument();
      expect(screen.queryByText(/Copo de Teste/i)).not.toBeInTheDocument();
    });
  });
});