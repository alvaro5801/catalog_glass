// src/app/admin/products/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProductsPage from '@/app/admin/products/page';
// Importar os tipos que o componente realmente usa
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client";

// --- Tipos de Mock ---
type Category = Pick<PrismaCategory, 'id' | 'name'>;

type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
    category: Category | null;
};

// --- Mocks Globais ---
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true); 

// Adicionamos esta simulação para a função 'scrollIntoView' que o Radix Select usa.
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Os mocks de dados (mockCategories e mockProducts) continuam iguais
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
        categoryId: "cat_1", // O ID da categoria
        specifications: null,
        priceTable: [ // A tabela de preços
            { id: 'p1', quantity: '10-29', price: 4.50, productId: 'prod_1' },
            { id: 'p2', quantity: '30-49', price: 4.20, productId: 'prod_1' },
            { id: 'p3', quantity: '100+', price: 3.50, productId: 'prod_1' },
        ],
        category: { id: 'cat_1', name: 'Copos' } // O objeto da categoria
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

    // Verificar os dados processados pelo componente
    expect(screen.getByText("Copo Long Drink")).toBeInTheDocument();
    expect(screen.getByText("Copos")).toBeInTheDocument();
    
    // ESTE TESTE AGORA DEVE PASSAR (graças à correção no page.tsx)
    expect(screen.getByText("R$ 3.50")).toBeInTheDocument();
  });

  it('deve permitir adicionar um novo produto', async () => {
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    await screen.findByText("Copo Long Drink");

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Produto/i }));
    await screen.findByText("Adicionar Novo Produto");

    // Preencher o formulário
    fireEvent.change(screen.getByLabelText(/Nome do Produto/i), { target: { value: 'Caneca Nova' } });
    fireEvent.change(screen.getByLabelText(/Preço \(Inicial\)/i), { target: { value: '15.99' } });
    
    // Clicar no <SelectTrigger> para abrir as opções
    fireEvent.click(screen.getByRole('combobox'));
    
    // Usamos 'findByRole' com 'option' que é mais específico para
    // itens de uma lista Radix, evitando a ambiguidade.
    fireEvent.click(await screen.findByRole('option', { name: 'Taças' }));

    // Simular a resposta da API (POST)
    const newProduct: ProductWithRelations = {
        id: 'prod_2', 
        name: 'Caneca Nova', 
        categoryId: 'cat_2', // Categoria "Taças"
        images: ['/images/placeholder.png'],
        priceTable: [{ id: 'p4', quantity: '1-10', price: 15.99, productId: 'prod_2' }],
        // ...outros campos obrigatórios do tipo PrismaProduct...
        slug: 'caneca-nova', 
        shortDescription: '...', 
        description: '...', 
        priceInfo: '...', 
        isFeatured: false, 
        catalogId: 'catalog_123', 
        specifications: null,
        category: { id: 'cat_2', name: 'Taças' }
    };
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProduct,
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // 1. Esperamos o nome "Caneca Nova" aparecer
    const newProductCell = await screen.findByText('Caneca Nova');
    
    // 2. Encontramos a linha (tr) mais próxima desse nome
    const newRow = newProductCell.closest('tr');
    
    // 3. Verificamos se os outros dados estão DENTRO (within) dessa linha
    expect(within(newRow!).getByAltText('Caneca Nova')).toBeInTheDocument();
    expect(within(newRow!).getByText('Taças')).toBeInTheDocument();
    expect(within(newRow!).getByText('R$ 15.99')).toBeInTheDocument();
  });

  it('deve permitir apagar um produto', async () => {
    mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCategories });

    render(<ProductsPage />);
    const productRow = await screen.findByText("Copo Long Drink");

    // Simular a API de DELETE (não precisa retornar nada, só 'ok')
    mockFetch.mockResolvedValueOnce({ ok: true });

    const row = productRow.closest('tr')!;
    const deleteButton = within(row).getByRole('button', { name: /apagar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Tem a certeza que quer apagar este produto?");
    expect(mockFetch).toHaveBeenCalledWith('/api/products/prod_1', { method: 'DELETE' });

    await waitFor(() => {
        expect(screen.queryByText("Copo Long Drink")).not.toBeInTheDocument();
    });
  });
});