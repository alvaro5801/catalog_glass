// src/app/admin/products/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProductsPage from '@/app/admin/products/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true); 

const mockCategories = ["Copos", "Taças"];
const mockProducts = [
    { id: 1, name: "Copo Long Drink", category: "Copos", price: 4.50, image: "/images/products/long-drink-1.jpg" },
];

describe('ProductsPage - Gestão de Produtos', () => {

  beforeEach(() => {
    mockFetch.mockClear();
    (global.confirm as jest.Mock).mockClear();
  });

  it('deve carregar e exibir os produtos e categorias iniciais', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);

    await waitFor(() => {
        expect(screen.queryByText(/A carregar dados do catálogo.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Copo Long Drink")).toBeInTheDocument();
  });

  it('deve permitir adicionar um novo produto', async () => {
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    await screen.findByText("Copo Long Drink");

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produto/i }));
    await screen.findByText("Adicionar Novo Produto");

    fireEvent.change(screen.getByLabelText(/Nome do Produto/i), { target: { value: 'Caneca Nova' } });
    fireEvent.change(screen.getByLabelText(/Preço/i), { target: { value: '15.99' } });
    
    // ✅ CORREÇÃO DO SRC DA IMAGEM
    const newProduct = { id: 2, name: 'Caneca Nova', category: 'Copos', price: 15.99, image: '/images/placeholder.png' };
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProduct,
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // O teste agora procura pelo nome E pela imagem para garantir que a renderização está correta
    await screen.findByText('Caneca Nova');
    expect(screen.getByAltText('Caneca Nova')).toBeInTheDocument();
  });

  it('deve permitir apagar um produto', async () => {
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    const productRow = await screen.findByText("Copo Long Drink");

    mockFetch.mockResolvedValueOnce({ ok: true });

    const row = productRow.closest('tr')!;
    // A busca continua a mesma, mas agora ela encontrará o botão com o aria-label correto
    const deleteButton = within(row).getByRole('button', { name: /apagar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Tem a certeza que quer apagar este produto?");

    await waitFor(() => {
        expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });
});