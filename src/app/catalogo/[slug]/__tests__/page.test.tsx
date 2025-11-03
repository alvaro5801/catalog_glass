// src/app/catalogo/[slug]/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
// ✅ CORREÇÃO: Importar 'products' diretamente, tal como a página faz
import ProductPage, { generateStaticParams } from '../page';
import { products } from '@/data/products'; // <-- Importar dados reais
import { notFound } from 'next/navigation';
// 🗑️ REMOVER: Tipos não usados do Prisma
// import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';
// ✅ NOVO: Importar o tipo Product que a página usa
import type { Product } from '@/lib/types';

// 🗑️ REMOVER: Mock do ProductService não é necessário aqui
/*
jest.mock('@/domain/services/ProductService', ...);
jest.mock('@/domain/repositories/ProductRepository', ...);
const { mockGetProducts, mockGetProductById } = jest.requireMock('@/domain/services/ProductService').__mocks__;
*/

// Mock do ProductDetail (continua igual)
const mockProductDetail = jest.fn();
jest.mock('@/components/product-detail', () => ({
  ProductDetail: (props: { product: Product }) => { // Tipar as props esperadas
    mockProductDetail(props);
    return <div data-testid="mock-product-detail">Detalhes Mock</div>;
  },
}));

// Mock do notFound (continua igual)
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => '' }), // Manter mocks relevantes
}));

// 🗑️ REMOVER: Dados de teste mockados não são necessários, usamos os reais importados
/*
const mockProductWithSpecs = ...;
const mockProductWithoutSpecs = ...;
*/

describe('ProductPage (Server Component)', () => {

  beforeEach(() => {
    // mockGetProducts.mockClear(); // Remover chamadas relacionadas ao mock
    mockProductDetail.mockClear();
    mockNotFound.mockClear();
  });

  // Teste para generateStaticParams
  it('generateStaticParams deve retornar slugs dos produtos reais', async () => {
    // 🗑️ REMOVER: Não precisamos mockar 'getProducts' aqui
    // mockGetProducts.mockResolvedValue([mockProductWithSpecs, mockProductWithoutSpecs]);

    // ✅ CORREÇÃO: generateStaticParams usa 'products' diretamente
    // A função generateStaticParams() é exportada pela page.tsx e usa os dados importados.
    const params = generateStaticParams(); // Agora usa os dados reais importados

    // ✅ CORREÇÃO: Esperar os slugs REAIS do ficheiro products.ts
    expect(params).toEqual(products.map(p => ({ slug: p.slug })));

    // 🗑️ REMOVER: Verificar se getProducts foi chamado já não faz sentido
    // expect(mockGetProducts).toHaveBeenCalledTimes(1);
  });

  it('deve buscar o produto real e renderizar ProductDetail', async () => {
    // 🗑️ REMOVER: Não precisamos mockar 'getProducts' aqui
    // mockGetProducts.mockResolvedValue([mockProductWithSpecs]);

    // ✅ CORREÇÃO: Encontrar o produto nos dados REAIS
    const productSlugToTest = 'copo-long-drink-personalizado'; // Usar um slug real
    const productToTest = products.find(p => p.slug === productSlugToTest);
    if (!productToTest) throw new Error(`Produto real com slug "${productSlugToTest}" não encontrado para o teste`); // Garantia

    const props = { params: { slug: productSlugToTest } };

    // Execução (continua igual, mas agora a página usa os dados reais)
    // Server Components retornam a promise do JSX, await resolve isso
    const resolvedComponent = await ProductPage(props);
    render(resolvedComponent);

    // Verificação
    // 🗑️ REMOVER: mockGetProducts não é chamado
    // expect(mockGetProducts).toHaveBeenCalledTimes(1);
    expect(mockNotFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('mock-product-detail')).toBeInTheDocument();

    // ✅ CORREÇÃO: Verificar se ProductDetail foi chamado com os dados REAIS
    // A página passa o objeto 'product' inteiro encontrado
    expect(mockProductDetail).toHaveBeenCalledWith({
       product: productToTest // Espera o objeto completo dos dados reais
    });
  });

  it('deve chamar notFound se o produto não for encontrado pelo slug nos dados reais', async () => {
     // 🗑️ REMOVER: Mock de getProducts não é necessário
     // mockGetProducts.mockClear();
     // mockGetProducts.mockResolvedValue([mockProductWithoutSpecs]);

     const props = { params: { slug: 'slug-nao-existe' } };

     // Execução e Verificação (como estava, mas sem a verificação do mockGetProducts)
     // Como é um Server Component que chama notFound, ele lança um erro específico.
     // Testamos se a função mockada notFound foi chamada.
     // Usamos try/catch porque notFound() interrompe a renderização.
     try {
       await ProductPage(props);
     } catch (e: any) {
        // É esperado que notFound() lance um erro interno específico do Next.js
        // Não precisamos verificar o tipo exato do erro aqui, apenas que notFound foi chamada.
     }
     expect(mockNotFound).toHaveBeenCalledTimes(1);
     expect(mockProductDetail).not.toHaveBeenCalled();
     // 🗑️ REMOVER: expect(mockGetProducts).toHaveBeenCalledTimes(1);
  });

  // ✅ CORREÇÃO: REMOVER ESTE TESTE - A página atual não tem lógica para verificar 'specifications'
  /*
   it('deve chamar notFound se o produto encontrado não tiver especificações', async () => {
    // ... Este teste não reflete a lógica atual da page.tsx ...
  });
  */

});