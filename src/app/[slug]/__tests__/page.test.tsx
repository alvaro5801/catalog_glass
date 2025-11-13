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

// 2. Mock do Repositório (necessário porque é instanciado na página)
jest.mock("@/domain/repositories/CatalogRepository");

// 3. Mock do Componente Visual (CatalogContent)
// Para não testarmos a complexidade do catálogo aqui, apenas se ele é chamado
jest.mock("../../catalogo/catalog-content", () => ({
  CatalogContent: () => <div data-testid="catalog-content">Conteúdo da Loja</div>,
}));

// 4. Mock do notFound do Next.js
const mockNotFound = jest.fn();
jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

describe("Public Store Page ([slug])", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a loja quando o catálogo existe", async () => {
    // Preparação
    mockGetCatalogBySlug.mockResolvedValue({
      id: "1",
      slug: "minha-loja",
      products: [{ id: "p1", name: "Produto 1" }],
      categories: [{ id: "c1", name: "Categoria 1" }],
    });

    const params = Promise.resolve({ slug: "minha-loja" });

    // Execução
    const page = await PublicStorePage({ params });
    render(page);

    // Verificação
    // Vê se o título da loja aparece
    expect(screen.getByText("Loja: minha-loja")).toBeInTheDocument();
    // Vê se o componente de conteúdo foi carregado
    expect(screen.getByTestId("catalog-content")).toBeInTheDocument();
    // Garante que NÃO chamou o notFound
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
      // O notFound lança um erro interno no Next.js, apanhamos aqui
    }

    // Verificação
    expect(mockNotFound).toHaveBeenCalled();
  });
});