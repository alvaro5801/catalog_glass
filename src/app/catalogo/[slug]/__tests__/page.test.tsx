// src/app/catalogo/[slug]/__tests__/page.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
// ✅ CORREÇÃO 1: Remover 'generateStaticParams' da importação
import ProductPage from '../page'; 
import type { Product } from '@/lib/types';
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';

// Mock do ProductService
jest.mock('@/domain/services/ProductService', () => {
  const mockGetProducts = jest.fn(); 
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProducts: mockGetProducts, 
    })),
    __mocks__: { mockGetProducts },
  };
});
jest.mock('@/domain/repositories/ProductRepository');
const { __mocks__ } = jest.requireMock('@/domain/services/ProductService');
const { mockGetProducts } = __mocks__;

// Mock do ProductDetail
const mockProductDetail = jest.fn();
jest.mock('@/components/product-detail', () => ({
  ProductDetail: (props: { product: Product }) => {
    mockProductDetail(props);
    return <div data-testid="mock-product-detail">Detalhes Mock</div>;
  },
}));

// Mock do notFound
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

// Tipos e Dados de Teste (iguais)
type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};
const mockProductData: ProductWithRelations = {
  id: 'prod_1',
  slug: 'copo-long-drink-personalizado',
  name: 'Copo Long Drink',
  categoryId: 'cat_1',
  specifications: { id: 's1', material: 'Acrílico', capacidade: '350ml', dimensoes: '15cm', productId: 'prod_1' },
  priceTable: [{ id: 'pt1', quantity: '10-29', price: 4.5, productId: 'prod_1' }],
  shortDescription: 'Descrição curta',
  description: 'Descrição longa',
  images: ['/images/products/long-drink-1.jpg'],
  priceInfo: 'Preço info',
  isFeatured: false,
  catalogId: 'cat123'
};
const formattedProductData: Product = {
  id: 'prod_1',
  slug: 'copo-long-drink-personalizado',
  name: 'Copo Long Drink',
  category: 'cat_1',
  specifications: { material: 'Acrílico', capacidade: '350ml', dimensoes: '15cm' },
  priceTable: [{ quantity: '10-29', price: 4.5 }],
  shortDescription: 'Descrição curta',
  description: 'Descrição longa',
  images: ['/images/products/long-drink-1.jpg'],
  priceInfo: 'Preço info',
  isFeatured: false,
};

// --- TESTES ---
describe('ProductPage (Server Component)', () => {
  beforeEach(() => {
    mockProductDetail.mockClear();
    mockNotFound.mockClear();
    mockGetProducts.mockClear();
  });

  // ✅ CORREÇÃO 2: Remover este bloco de teste inteiro (agora está obsoleto)
  /*
  it('generateStaticParams deve retornar slugs do serviço', async () => {
    mockGetProducts.mockResolvedValue([mockProductData]);
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: 'copo-long-drink-personalizado' }]);
  });
  */

  it('deve buscar o produto no serviço e renderizar ProductDetail', async () => {
    mockGetProducts.mockResolvedValue([mockProductData]);
    const props = { params: { slug: 'copo-long-drink-personalizado' } };
    const resolvedComponent = await ProductPage(props);
    render(resolvedComponent);
    expect(mockProductDetail).toHaveBeenCalledWith({
       product: formattedProductData
    });
  });

  it('deve chamar notFound se o produto não for encontrado pelo serviço', async () => {
    mockGetProducts.mockResolvedValue([]);
    const props = { params: { slug: 'slug-nao-existe' } };
     try {
       await ProductPage(props); 
     } catch { 
       // O notFound() vai lançar um erro
     }
     expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it('deve chamar notFound se o produto for encontrado mas não tiver especificações', async () => {
    const productSemSpecs = { ...mockProductData, specifications: null };
    mockGetProducts.mockResolvedValue([productSemSpecs]);
    const props = { params: { slug: 'copo-long-drink-personalizado' } };
     try {
       await ProductPage(props); 
     } catch { 
        // O notFound() vai lançar um erro
     }
     expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});