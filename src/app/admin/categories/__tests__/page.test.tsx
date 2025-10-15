// src/app/admin/categories/__tests__/page.test.tsx
import React from 'react';
// 1. ✅ Importar o 'within' para buscas mais precisas
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CategoriesPage from '@/app/admin/categories/page';

// --- SIMULAÇÃO (MOCK) DA API FETCH ---
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('CategoriesPage - Gestão de Categorias', () => {

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('deve carregar e exibir as categorias iniciais da API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas", "Comidas"],
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Bebidas")).toBeInTheDocument();
    expect(screen.getByText("Comidas")).toBeInTheDocument();
  });

  it('deve permitir adicionar uma nova categoria', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas"],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas", "Decoração"],
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Decoração' } });

    const addButton = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addButton);

    const newCategoryItem = await screen.findByText("Decoração");
    expect(newCategoryItem).toBeInTheDocument();
  });

  it('deve permitir apagar uma categoria', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas", "Para Apagar"],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Para Apagar");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas"],
    });

    // --- 2. ✅ CORREÇÃO AQUI ---
    // Primeiro, encontramos o elemento que contém o texto da categoria
    const categoryItem = screen.getByText("Para Apagar");
    // Depois, encontramos o 'div' pai que representa a linha inteira
    const row = categoryItem.closest('div')!; // O '!' diz ao TypeScript que temos a certeza que a linha existe
    
    // Finalmente, procuramos DENTRO daquela linha por um botão cujo nome COMECE com "Apagar".
    // A expressão regular /^Apagar/i garante que não corresponde a "Editar".
    const deleteButton = within(row).getByRole('button', { name: /^Apagar/i });
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.queryByText("Para Apagar")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
  });
});