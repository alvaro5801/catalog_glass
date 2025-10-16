// src/app/admin/categories/__tests__/page.test.tsx
import React from 'react';
// ✅ 1. Importar a função 'act'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import CategoriesPage from '@/app/admin/categories/page';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

jest.useFakeTimers();

describe('CategoriesPage - Gestão de Categorias', () => {

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('deve carregar e exibir as categorias iniciais da API', async () => {
    // ... (sem alterações)
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ["Bebidas", "Comidas"] });
    render(<CategoriesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
  });

  it('deve permitir adicionar uma nova categoria e limpar a mensagem de sucesso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ["Bebidas"] });
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ["Bebidas", "Decoração"] });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Decoração' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    await screen.findByText("Decoração");
    expect(await screen.findByText(/Categoria adicionada com sucesso!/i)).toBeInTheDocument();

    // ✅ 2. Envolver a chamada do temporizador com 'act'
    // Isto garante que o React processa a atualização de estado antes de o teste continuar.
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria adicionada com sucesso!/i)).not.toBeInTheDocument();
    });
  });

  it('deve permitir apagar uma categoria e limpar a mensagem de sucesso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ["Bebidas", "Para Apagar"] });

    render(<CategoriesPage />);
    await screen.findByText("Para Apagar");

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ["Bebidas"] });

    const categoryItem = screen.getByText("Para Apagar");
    const row = categoryItem.closest('div')!;
    const deleteButton = within(row).getByRole('button', { name: /^Apagar/i });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText("Para Apagar")).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/Categoria apagada com sucesso!/i)).toBeInTheDocument();

    // ✅ 3. Fazer o mesmo ajuste aqui
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria apagada com sucesso!/i)).not.toBeInTheDocument();
    });
  });
});