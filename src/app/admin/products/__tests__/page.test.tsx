// src/app/admin/products/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProductsPage from '@/app/admin/products/page';

// Mock the global fetch and confirm functions
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true);

// ✅ CORRECTION: The mock data now matches the 'ProductType' structure
const mockCategories = ["Copos", "Taças"];
const mockProducts = [
  {
    id: 1,
    name: "Copo Long Drink",
    category: "Copos",
    images: ["/images/products/long-drink-1.jpg"], // 'image' is now 'images' (array)
    priceTable: [{ quantity: '10-29', price: 4.50 }]  // 'price' is now 'priceTable' (array of objects)
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

    // ✅ CORRECTION: The new product must also have the correct structure
    const newProduct = {
      id: 2,
      name: 'Caneca Nova',
      category: 'Copos',
      images: ['/images/placeholder.png'],
      priceTable: [{ quantity: '1', price: 15.99 }]
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newProduct,
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await screen.findByText('Caneca Nova');
    expect(screen.getByAltText('Caneca Nova')).toBeInTheDocument();
  });

  it('deve permitir editar um produto existente', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    const productRow = await screen.findByText("Copo Long Drink");

    const row = productRow.closest('tr')!;
    const editButton = within(row).getByRole('button', { name: /Editar Copo Long Drink/i });
    fireEvent.click(editButton);

    await screen.findByText("Editar Produto");
    const nameInput = screen.getByLabelText(/Nome do Produto/i);

    fireEvent.change(nameInput, { target: { value: 'Copo Long Drink Editado' } });

    // ✅ CORRECTION: The updated product must also have the correct structure
    const updatedProduct = { ...mockProducts[0], name: 'Copo Long Drink Editado' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedProduct,
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(screen.getByText('Copo Long Drink Editado')).toBeInTheDocument();
      expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });

  it('deve permitir apagar um produto', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    const productRow = await screen.findByText("Copo Long Drink");

    mockFetch.mockResolvedValueOnce({ ok: true });

    const row = productRow.closest('tr')!;
    const deleteButton = within(row).getByRole('button', { name: /apagar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Tem a certeza que quer apagar este produto?");

    await waitFor(() => {
      expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });
});