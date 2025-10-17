// src/app/admin/products/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProductsPage from '@/app/admin/products/page';

// Simular o fetch e o confirm
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true);

// ✅ Dados de teste atualizados com IDs de string
const mockCategories = [
  { id: 'cat1', name: "Copos" },
  { id: 'cat2', name: "Taças" }
];
const mockProducts = [
  {
    id: 'prod1',
    name: "Copo Long Drink",
    categoryId: "cat1",
    images: ["/images/products/long-drink-1.jpg"],
    priceTable: [{ quantity: '10-29', price: 4.50 }]
  },
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

    // Espera que o texto de carregamento desapareça e o produto seja renderizado
    await waitFor(() => {
      expect(screen.queryByText(/A carregar dados/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText("Copo Long Drink")).toBeInTheDocument();
    // Verifica se o nome da categoria também é renderizado
    expect(screen.getByText("Copos")).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/Preço Inicial/i), { target: { value: '15.99' } });

    const newProduct = { ...mockProducts[0], id: 'prod2', name: 'Caneca Nova' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => newProduct });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    // Espera que o novo produto apareça na tabela
    expect(await screen.findByText('Caneca Nova')).toBeInTheDocument();
  });

  it('deve permitir apagar um produto', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    const productRow = await screen.findByText("Copo Long Drink");

    // Simula a resposta da API de DELETE (geralmente é 204 No Content, mas aqui não importa)
    mockFetch.mockResolvedValueOnce({ ok: true });

    const row = productRow.closest('tr')!;
    const deleteButton = within(row).getByRole('button', { name: /apagar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Tem a certeza que quer apagar este produto?");

    // Espera que o produto desapareça da tela
    await waitFor(() => {
      expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });
});