// src/app/admin/products/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import ProductsPage from '@/app/admin/products/page';
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client";
import { upload } from '@vercel/blob/client';

// --- MOCKS ---
jest.mock('@vercel/blob/client', () => ({
  upload: jest.fn(),
}));

// Tipos auxiliares
type Category = Pick<PrismaCategory, 'id' | 'name'>;
type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
    category: Category | null;
};

// Mock Global do Fetch e Confirm
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true); 

if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// --- DADOS DE TESTE ---
const fixedDate = new Date();
const mockCategories: Category[] = [
    { id: 'cat_1', name: 'Copos' },
    { id: 'cat_2', name: 'Taças' },
];

const mockProducts: ProductWithRelations[] = [
    { 
        id: 'prod_1', 
        name: "Copo Long Drink", 
        slug: 'copo-long-drink',
        shortDescription: '...',
        description: '...',
        images: ["/images/products/long-drink-1.jpg"],
        priceInfo: '...',
        isFeatured: false,
        catalogId: 'catalog_123',
        categoryId: "cat_1",
        specifications: null,
        priceTable: [
            { id: 'p1', quantity: '10-29', price: 4.50, productId: 'prod_1' },
            { id: 'p2', quantity: '30-49', price: 4.20, productId: 'prod_1' },
            { id: 'p3', quantity: '100+', price: 3.50, productId: 'prod_1' },
        ],
        category: { id: 'cat_1', name: 'Copos' },
        createdAt: fixedDate,
        updatedAt: fixedDate
    },
];

describe('ProductsPage - Gestão de Produtos', () => {

  beforeEach(() => {
    // ✅ CRÍTICO: mockReset() limpa todas as respostas configuradas anteriormente.
    // Isso evita que "lixo" de um teste afete o outro (o erro do map is not a function).
    mockFetch.mockReset();
    (global.confirm as jest.Mock).mockClear();
    (upload as jest.Mock).mockClear();
  });

  it('deve carregar e exibir os produtos e categorias iniciais', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);

    // Espera o loading desaparecer
    await waitFor(() => {
        expect(screen.queryByText(/A carregar dados do catálogo.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Copo Long Drink")).toBeInTheDocument();
    expect(screen.getByText("Copos")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.50")).toBeInTheDocument();
  });

  it('deve permitir adicionar um novo produto (fluxo básico sem upload)', async () => {
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    
    // ✅ CORREÇÃO: Esperar que o botão apareça (fim do loading) antes de clicar
    await waitFor(() => {
        expect(screen.queryByText(/A carregar dados/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produto/i }));
    
    // Agora o modal deve estar visível
    await screen.findByText("Adicionar Novo Produto");

    // Preencher o formulário
    fireEvent.change(screen.getByLabelText(/Nome do Produto/i), { target: { value: 'Caneca Nova' } });
    fireEvent.change(screen.getByLabelText(/Preço \(Inicial\)/i), { target: { value: '15.99' } });
    
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Taças' }));

    // Mock da resposta do POST
    const newProduct: ProductWithRelations = {
        id: 'prod_2', 
        name: 'Caneca Nova', 
        categoryId: 'cat_2', 
        images: ['/images/placeholder.png'], 
        priceTable: [{ id: 'p4', quantity: '1-10', price: 15.99, productId: 'prod_2' }],
        slug: 'caneca-nova', 
        shortDescription: '...', 
        description: '...', 
        priceInfo: '...', 
        isFeatured: false, 
        catalogId: 'catalog_123', 
        specifications: null,
        category: { id: 'cat_2', name: 'Taças' },
        createdAt: fixedDate,
        updatedAt: fixedDate
    };

    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProduct,
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    const newProductCell = await screen.findByText('Caneca Nova');
    const newRow = newProductCell.closest('tr');
    
    expect(within(newRow!).getByAltText('Caneca Nova')).toBeInTheDocument();
    expect(within(newRow!).getByText('Taças')).toBeInTheDocument();
    expect(within(newRow!).getByText('R$ 15.99')).toBeInTheDocument();
  });

  it('deve fazer upload da imagem e salvar o produto com o URL retornado', async () => {
    // 1. Configuração dos Mocks Iniciais
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    const fakeImageUrl = 'https://minha-imagem-na-nuvem.com/foto.jpg';
    (upload as jest.Mock).mockResolvedValue({
      url: fakeImageUrl,
    });

    // Mock da resposta final (POST)
    const productWithImage: ProductWithRelations = { 
        id: 'prod_novo', 
        name: 'Produto Com Foto', 
        slug: 'produto-com-foto',
        shortDescription: '...',
        description: '...',
        priceInfo: '...',
        isFeatured: false,
        catalogId: 'cat_123',
        specifications: null,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        images: [fakeImageUrl], 
        categoryId: 'cat_1',
        priceTable: [{ id: 'p_img', quantity: '1', price: 20, productId: 'prod_novo' }],
        category: { id: 'cat_1', name: 'Copos' }
    };

    // Configura a resposta do POST que acontecerá no final
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productWithImage,
    });

    render(<ProductsPage />);
    
    // ✅ CORREÇÃO: Esperar o loading terminar!
    await waitFor(() => {
        expect(screen.queryByText(/A carregar dados/i)).not.toBeInTheDocument();
    });
    
    // Agora é seguro clicar
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produto/i }));
    
    fireEvent.change(screen.getByLabelText(/Nome do Produto/i), { target: { value: 'Produto Com Foto' } });
    fireEvent.change(screen.getByLabelText(/Preço/i), { target: { value: '20' } });
    
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Copos' }));

    // --- SIMULAR UPLOAD ---
    const file = new File(['(conteúdo binário)'], 'foto.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Imagem do Produto/i); 

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(upload).toHaveBeenCalled();

    // --- SALVAR ---
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(fakeImageUrl), 
      })
    );
  });

  it('deve permitir apagar um produto', async () => {
    // Setup Inicial
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    
    // ✅ CORREÇÃO: findByText já espera implicitamente, mas garante que o mockFetch inicial foi consumido
    const productRowText = await screen.findByText("Copo Long Drink");

    // Mock da resposta do DELETE
    mockFetch.mockResolvedValueOnce({ ok: true });

    const row = productRowText.closest('tr')!;
    const deleteButton = within(row).getByRole('button', { name: /apagar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Tem a certeza que quer apagar este produto?");
    expect(mockFetch).toHaveBeenCalledWith('/api/products/prod_1', { method: 'DELETE' });

    await waitFor(() => {
        expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });
});