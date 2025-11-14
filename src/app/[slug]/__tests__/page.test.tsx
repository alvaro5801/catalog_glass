// src/app/[slug]/__tests__/page.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import PublicStorePage from "../page"; 

// --- MOCKS ---

// 1. Mock do Serviço de Catálogo
const mockGetCatalogBySlug = jest.fn();
jest.mock("@/domain/services/CatalogService", () => {
  return {
    CatalogService: jest.fn().mockImplementation(() => ({
      getCatalogBySlug: mockGetCatalogBySlug,
    })),
  };
});

// 2. Mock do Repositório
jest.mock("@/domain/repositories/CatalogRepository");

// 3. Mock do Componente Visual (CatalogContent)
// IMPORTANTE: Deve usar o mesmo caminho de importação que o componente real usa (@/app/...)
jest.mock("@/app/catalogo/catalog-content", () => ({
  CatalogContent: () => <div data-testid="catalog-content">Conteúdo da Loja</div>,
}));

// 4. Mock do notFound do Next.js
const mockNotFound = jest.fn();
jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

// 5. Mock do next/link
jest.mock("next/link", () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: { href: string, children: React.ReactNode }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("Public Store Page ([slug])", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a loja com o layout correto quando o catálogo existe", async () => {
    // Preparação
    mockGetCatalogBySlug.mockResolvedValue({
      id: "1",
      slug: "minha-loja-teste",
      products: [{ id: "p1", name: "Produto 1" }],
      categories: [{ id: "c1", name: "Categoria 1" }],
    });

    // Simula os parâmetros como Promise (Next.js 15)
    const params = Promise.resolve({ slug: "minha-loja-teste" });

    // Execução
    const page = await PublicStorePage({ params });
    render(page);

    // Verificação:
    
    // 1. Título da Loja (sem hífens)
    expect(screen.getByRole("heading", { 
        name: /minha loja teste/i 
    })).toBeInTheDocument();

    // 2. Elementos do Header
    expect(screen.getByText("Catálogo Digital")).toBeInTheDocument();

    // 3. Conteúdo Principal
    expect(screen.getByTestId("catalog-content")).toBeInTheDocument();

    // 4. Rodapé
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, "i"))).toBeInTheDocument();
    expect(screen.getByText(/Powered by/i)).toBeInTheDocument();

    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it("deve chamar notFound() quando o catálogo não existe", async () => {
    // Preparação
    mockGetCatalogBySlug.mockResolvedValue(null);

    const params = Promise.resolve({ slug: "loja-inexistente" });

    // Execução
    try {
      await PublicStorePage({ params });
    } catch (e) {
      // O notFound lança um erro interno, ignoramos no teste
    }

    // Verificação
    expect(mockNotFound).toHaveBeenCalled();
  });
});