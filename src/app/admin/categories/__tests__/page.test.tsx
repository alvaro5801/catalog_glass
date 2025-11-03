// src/app/admin/categories/__tests__/page.test.tsx
import React from 'react';
// ✅ Importámos o 'act' (da branch main)
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import CategoriesPage from '@/app/admin/categories/page';

// Simulação global do fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// ✅ Adicionámos os temporizadores (da branch main)
jest.useFakeTimers();

describe('CategoriesPage - Gestão de Categorias', () => {

  beforeEach(() => {
    mockFetch.mockClear();
  });

  // ✅ Adicionámos o 'afterEach' e 'afterAll' (da branch main)
  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // --- Testes de Sucesso ---

  it('deve carregar e exibir as categorias iniciais da API', async () => {
    // ✅ Usámos o mock de objetos (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'c1', name: 'Bebidas' },
        { id: 'c2', name: 'Comidas' }
      ],
    });

    render(<CategoriesPage />);

    // Espera o loading desaparecer
    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });

    // Verifica se os dados (já mapeados para string) apareceram
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
    expect(screen.getByText("Comidas")).toBeInTheDocument();
  });

  it('deve permitir adicionar uma nova categoria e limpar a mensagem de sucesso', async () => {
    // ✅ Usámos o mock de objetos (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    // ✅ Usámos o mock de objeto no POST (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'c2', name: 'Decoração' }), // API POST
    });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Decoração' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Espera pela nova categoria e pela mensagem de sucesso
    const newCategoryItem = await screen.findByText("Decoração");
    expect(newCategoryItem).toBeInTheDocument();
    expect(await screen.findByText('Categoria adicionada com sucesso!')).toBeInTheDocument();

    // ✅ Adicionámos o teste do temporizador (da branch main)
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria adicionada com sucesso!/i)).not.toBeInTheDocument();
    });
  });

  it('deve permitir apagar uma categoria e limpar a mensagem de sucesso', async () => {
    // ✅ Usámos o mock de objetos (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'c1', name: 'Bebidas' },
        { id: 'c2', name: 'Para Apagar' }
      ],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Para Apagar");

    // Mock da resposta do DELETE (correto em ambas as branches)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Bebidas"], // API [name]/route.ts retorna a lista
    });

    const categoryItem = screen.getByText("Para Apagar");
    const row = categoryItem.closest('div')!;
    
    // ✅ Usámos o seletor mais específico (da branch feature/test)
    const deleteButton = within(row).getByRole('button', { name: /Apagar Para Apagar/i });
    
    fireEvent.click(deleteButton);
    
    // Espera a categoria desaparecer e a mensagem de sucesso aparecer
    await waitFor(() => {
      expect(screen.queryByText("Para Apagar")).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Categoria apagada com sucesso!')).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();

    // ✅ Adicionámos o teste do temporizador (da branch main)
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Categoria apagada com sucesso!/i)).not.toBeInTheDocument();
    });
  });

  // --- Testes de Erro (Mantidos da branch feature/test) ---
  
  it('deve exibir uma mensagem de erro se o carregamento inicial (GET) falhar', async () => {
    // Simular uma falha na API
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Erro de servidor", details: "Falha na BD" }),
    });

    render(<CategoriesPage />);

    // Espera o loading desaparecer
    await waitFor(() => {
      expect(screen.queryByText(/A carregar categorias.../i)).not.toBeInTheDocument();
    });

    // Verifica se a mensagem de erro específica do 'catch' do 'useEffect' foi mostrada
    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a adição (POST) falhar', async () => {
    // ✅ Usámos o mock de objetos (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    await screen.findByText("Bebidas");

    // Simular falha no POST (ex: nome já existe)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Esta categoria já existe." }),
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Bebidas' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Espera pela mensagem de erro vinda da API
    expect(await screen.findByText("Esta categoria já existe.")).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se a edição (PUT) falhar', async () => {
    // ✅ Usámos o mock de objetos (da branch feature/test)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'c1', name: 'Bebidas' }],
    });
    
    render(<CategoriesPage />);
    const categoryItem = await screen.findByText("Bebidas");
    
    // Clicar em Editar
    const row = categoryItem.closest('div')!;
    const editButton = within(row).getByRole('button', { name: /Editar Bebidas/i });
    fireEvent.click(editButton);
    
    // Simular falha no PUT
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Erro interno no servidor" }),
    });
    
    // Clicar em Guardar
    const saveButton = within(row).getByRole('button', { name: /Guardar/i });
    fireEvent.click(saveButton);
    
    // Espera pela mensagem de erro que a API simulada realmente enviou
    expect(await screen.findByText("Erro interno no servidor")).toBeInTheDocument();
  });

});