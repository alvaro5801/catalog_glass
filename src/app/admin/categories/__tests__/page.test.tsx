// src/app/admin/categories/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import CategoriesPage from '@/app/admin/categories/page';

// Simulação global do fetch
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

  // --- Testes de Sucesso ---

  it('deve carregar e exibir as categorias iniciais da API', async () => {
    // ✅ MOCK CORRETO: Retorna objetos completos
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'c1', name: 'Bebidas' },
        { id: 'c2', name: 'Comidas' }
      ],
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Bebidas")).toBeInTheDocument();
    expect(screen.getByText("Comidas")).toBeInTheDocument();
  });

  it('deve permitir adicionar uma nova categoria e limpar a mensagem de sucesso', async () => {
    // 1. Carregamento inicial
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    // 2. Mock do POST (Adicionar)
    // A API real retorna o objeto da nova categoria criada
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'c2', name: 'Decoração' }), 
    });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Decoração' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Verifica se a nova categoria aparece na lista e a mensagem de sucesso
    const newCategoryItem = await screen.findByText("Decoração");
    expect(newCategoryItem).toBeInTheDocument();
    expect(await screen.findByText('Categoria adicionada com sucesso!')).toBeInTheDocument();

    // Avança o tempo para testar o desaparecimento da mensagem
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria adicionada com sucesso!/i)).not.toBeInTheDocument();
    });
  });

  it('deve permitir apagar uma categoria e limpar a mensagem de sucesso', async () => {
    // 1. Carregamento inicial com 2 categorias
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'c1', name: 'Bebidas' },
        { id: 'c2', name: 'Para Apagar' }
      ],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Para Apagar");

    // 2. Mock do DELETE
    // ⚠️ CORREÇÃO IMPORTANTE AQUI: 
    // O mock agora deve retornar uma lista de OBJETOS, tal como a API real faz.
    // O código novo precisa disto para fazer o .map(cat => cat.name) funcionar.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }], 
    });

    const categoryItem = screen.getByText("Para Apagar");
    const row = categoryItem.closest('div')!;
    
    const deleteButton = within(row).getByRole('button', { name: /Apagar Para Apagar/i });
    
    fireEvent.click(deleteButton);
    
    // Espera a categoria desaparecer
    await waitFor(() => {
      expect(screen.queryByText("Para Apagar")).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Categoria apagada com sucesso!')).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria apagada com sucesso!/i)).not.toBeInTheDocument();
    });
  });

  // --- Testes de Erro ---
  
  it('deve exibir uma mensagem de erro se o carregamento inicial (GET) falhar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Erro de servidor", details: "Falha na BD" }),
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a adição (POST) falhar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Esta categoria já existe." }),
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Bebidas' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(await screen.findByText("Esta categoria já existe.")).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a edição (PUT) falhar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    const categoryItem = await screen.findByText("Bebidas");
    
    const row = categoryItem.closest('div')!;
    const editButton = within(row).getByRole('button', { name: /Editar Bebidas/i });
    fireEvent.click(editButton);
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Erro interno no servidor" }),
    });
    
    const saveButton = within(row).getByRole('button', { name: /Guardar/i });
    fireEvent.click(saveButton);
    
    expect(await screen.findByText("Erro interno no servidor")).toBeInTheDocument();
  });

});