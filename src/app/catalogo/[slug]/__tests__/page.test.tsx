// src/app/catalogo/[slug]/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductPage, { generateStaticParams } from '../page'; // Importa a página e generateStaticParams
import { notFound } from 'next/navigation';
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';

// ✅ CORREÇÃO 1: Mocks definidos DENTRO do jest.mock
jest.mock('@/domain/services/ProductService', () => {
  const mockGetProducts = jest.fn();
  const mockGetProductById = jest.fn(); // Mock necessário para o tipo completo

  return {
    ProductService: jest.fn().mockImplementation(() => {
      return {
        getProducts: mockGetProducts,
        getProductById: mockGetProductById // Adicionado para completude
      };
    }),
    // ✅ CORREÇÃO 2: Exportar os mocks
    __mocks__: { mockGetProducts, mockGetProductById },
  };
});

// Mock do Repository (dependência interna - continua igual)
jest.mock('@/domain/repositories/ProductRepository', () => ({
  ProductRepository: jest.fn().mockImplementation(() => {}),
}));

// ✅ CORREÇÃO 3: Obter referência aos mocks exportados
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProducts, mockGetProductById } = __mocks__;


// 2. Simular o componente ProductDetail (como estava)
const mockProductDetail = jest.fn();
jest.mock('@/components/product-detail', () => ({
  ProductDetail: (props: any) => {
    mockProductDetail(props); // Chama a nossa função mock com as props recebidas
    return <div data-testid="mock-product-detail">Detalhes Mock</div>; // Renderiza um placeholder
  },
}));

// 3. Simular a função notFound (como estava)
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => '' }),
}));

// 4. Dados de Teste (como estava)
const mockProductWithSpecs: PrismaProduct & { specifications: Specification | null; priceTable: PriceTier[] } = {
  id: 'prod_1', name: 'Copo Teste Slug', slug: 'copo-teste-slug', categoryId: 'cat_1',
  images: ['/img1.jpg'], isFeatured: false, shortDescription: 'desc curta', description: 'desc longa',
  priceInfo: 'info preco', catalogId: 'mock_catalog',
  specifications: { id: 'spec_1', material: 'Acrílico', capacidade: '300ml', dimensoes: '15cm', productId: 'prod_1' },
  priceTable: [{ id: 'pt_1', quantity: '10+', price: 5.50, productId: 'prod_1' }],
};

const mockProductWithoutSpecs: PrismaProduct & { specifications: Specification | null; priceTable: PriceTier[] } = {
    ...mockProductWithSpecs,
    id: 'prod_2',
    slug: 'copo-sem-specs',
    specifications: null, // Produto sem especificações
};


describe('ProductPage (Server Component)', () => {

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    mockGetProducts.mockClear();
    mockProductDetail.mockClear();
    mockNotFound.mockClear();
  });

  // Teste para generateStaticParams (como estava)
  it('generateStaticParams deve retornar slugs dos produtos', async () => {
    mockGetProducts.mockResolvedValue([mockProductWithSpecs, mockProductWithoutSpecs]);
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: 'copo-teste-slug' },
      { slug: 'copo-sem-specs' },
    ]);
     // Verificar se getProducts foi chamado por generateStaticParams
     expect(mockGetProducts).toHaveBeenCalledTimes(1);
  });

  it('deve buscar o produto e renderizar ProductDetail com os dados formatados', async () => {
    // Preparação
    // É importante limpar aqui DE NOVO porque generateStaticParams também chama
    mockGetProducts.mockClear();
    mockGetProducts.mockResolvedValue([mockProductWithSpecs]);

    const props = { params: { slug: 'copo-teste-slug' } };

    // Execução
    const resolvedComponent = await ProductPage(props);
    render(resolvedComponent);

    // Verificação
    expect(mockGetProducts).toHaveBeenCalledTimes(1); // Chamado pela página
    expect(mockNotFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('mock-product-detail')).toBeInTheDocument();
    expect(mockProductDetail).toHaveBeenCalledWith({
      product: {
        id: mockProductWithSpecs.id,
        slug: mockProductWithSpecs.slug,
        name: mockProductWithSpecs.name,
        shortDescription: mockProductWithSpecs.shortDescription,
        description: mockProductWithSpecs.description,
        images: mockProductWithSpecs.images,
        priceInfo: mockProductWithSpecs.priceInfo,
        isFeatured: mockProductWithSpecs.isFeatured,
        category: mockProductWithSpecs.categoryId,
        specifications: {
          material: mockProductWithSpecs.specifications?.material,
          capacidade: mockProductWithSpecs.specifications?.capacidade,
          dimensoes: mockProductWithSpecs.specifications?.dimensoes,
        },
        priceTable: mockProductWithSpecs.priceTable,
      }
    });
  });

  it('deve chamar notFound se o produto não for encontrado pelo slug', async () => {
     // Preparação
     mockGetProducts.mockClear();
     mockGetProducts.mockResolvedValue([mockProductWithoutSpecs]); // Não inclui 'slug-nao-existe'

     const props = { params: { slug: 'slug-nao-existe' } };

     // Execução e Verificação
     try { await ProductPage(props); } catch (e) {}
     expect(mockNotFound).toHaveBeenCalledTimes(1);
     expect(mockProductDetail).not.toHaveBeenCalled();
     expect(mockGetProducts).toHaveBeenCalledTimes(1); // Garante que a busca foi feita
  });

   it('deve chamar notFound se o produto encontrado não tiver especificações', async () => {
    // Preparação
    mockGetProducts.mockClear();
    mockGetProducts.mockResolvedValue([mockProductWithoutSpecs]);

    const props = { params: { slug: 'copo-sem-specs' } };

    // Execução e Verificação
     try { await ProductPage(props); } catch (e) {}
     expect(mockNotFound).toHaveBeenCalledTimes(1);
     expect(mockProductDetail).not.toHaveBeenCalled();
     expect(mockGetProducts).toHaveBeenCalledTimes(1); // Garante que a busca foi feita
  });

});