// src/app/vitrine/__tests__/page.test.tsx

// ✅ CORREÇÃO: Adicionado eslint-disable para permitir 'any' neste polyfill
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.setImmediate = ((callback: (...args: any[]) => void, ...args: any[]) => {
  return setTimeout(callback, 0, ...args);
}) as unknown as typeof setImmediate;

import React from 'react';
import { render, screen } from '@testing-library/react';
import VitrinePage from '../page';
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from '@prisma/client';

// --- 1. SIMULAÇÕES (MOCKS) ---

// 1.1. Simular os Serviços
const mockGetProducts = jest.fn();
const mockGetAllCategories = jest.fn();

jest.mock('@/domain/services/ProductService', () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    getProducts: mockGetProducts,
  })),
}));
jest.mock('@/domain/services/CategoryService', () => ({
  CategoryService: jest.fn().mockImplementation(() => ({
    getAllCategories: mockGetAllCategories,
  })),
}));

// 1.2. Simular os Repositórios
jest.mock('@/domain/repositories/ProductRepository');
jest.mock('@/domain/repositories/CategoryRepository');

// 1.3. Simular o Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    catalog: {
      findFirst: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma'; 

// 1.4. Simular o PageLayout
jest.mock('@/app/page-layout', () => {
  const MockPageLayout = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-page-layout">{children}</div>;
  };
  MockPageLayout.displayName = 'MockPageLayout';
  return MockPageLayout;
});

// 1.5. Simular o HomeContent
const mockHomeContent = jest.fn();
jest.mock('@/app/home-content', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeContent: (props: any) => {
    mockHomeContent(props);
    return <div data-testid="mock-home-content">Conteúdo da Home</div>;
  },
}));

// 1.6. Simular o next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/vitrine',
  useRouter: () => ({ push: jest.fn() }),
}));

// --- 2. DADOS DE TESTE ---

const EXPECTED_CATALOG_ID = "clxrz8hax00003b6khe69046c";

const mockApiCategories: PrismaCategory[] = [
  { id: 'cat-1', name: 'Copos', catalogId: EXPECTED_CATALOG_ID, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', name: 'Taças', catalogId: EXPECTED_CATALOG_ID, createdAt: new Date(), updatedAt: new Date() },
];

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

const mockApiProducts: ProductWithRelations[] = [
  {
    id: 'prod-1',
    slug: 'copo-destaque',
    name: 'Copo Destaque',
    images: ['/img1.jpg'],
    isFeatured: true,
    categoryId: 'cat-1',
    specifications: { id: 's1', material: 'Acrílico', capacidade: '300ml', dimensoes: '10cm', productId: 'prod-1' },
    priceTable: [{ id: 'p1', quantity: '100', price: 5, productId: 'prod-1' }],
    shortDescription: 'curta',
    description: 'longa',
    priceInfo: 'info',
    catalogId: EXPECTED_CATALOG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    slug: 'taca-comum',
    name: 'Taça Comum',
    images: ['/img2.jpg'],
    isFeatured: false,
    categoryId: 'cat-2',
    specifications: { id: 's2', material: 'Vidro', capacidade: '500ml', dimensoes: '20cm', productId: 'prod-2' },
    priceTable: [{ id: 'p2', quantity: '50', price: 15, productId: 'prod-2' }],
    shortDescription: 'curta 2',
    description: 'longa 2',
    priceInfo: 'info 2',
    catalogId: EXPECTED_CATALOG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-3',
    slug: 'caneca-destaque',
    name: 'Caneca Destaque',
    images: ['/img3.jpg'],
    isFeatured: true,
    categoryId: 'cat-99',
    specifications: null,
    priceTable: [],
    shortDescription: "",
    description: "",
    priceInfo: "",
    catalogId: EXPECTED_CATALOG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const expectedAllProducts = [
  {
    id: 'prod-1',
    slug: 'copo-destaque',
    name: 'Copo Destaque',
    images: ['/img1.jpg'],
    shortDescription: 'curta',
    description: 'longa',
    category: 'Copos',
    specifications: { material: 'Acrílico', capacidade: '300ml', dimensoes: '10cm' },
    priceTable: [{ quantity: '100', price: 5 }],
    priceInfo: 'info',
    isFeatured: true,
  },
  {
    id: 'prod-2',
    slug: 'taca-comum',
    name: 'Taça Comum',
    images: ['/img2.jpg'],
    shortDescription: 'curta 2',
    description: 'longa 2',
    category: 'Taças',
    specifications: { material: 'Vidro', capacidade: '500ml', dimensoes: '20cm' },
    priceTable: [{ quantity: '50', price: 15 }],
    priceInfo: 'info 2',
    isFeatured: false,
  },
  {
    id: 'prod-3',
    slug: 'caneca-destaque',
    name: 'Caneca Destaque',
    images: ['/img3.jpg'],
    shortDescription: '',
    description: '',
    category: 'N/A',
    specifications: { material: '', capacidade: '', dimensoes: '' },
    priceTable: [],
    priceInfo: '',
    isFeatured: true,
  },
];

const expectedFeaturedProducts = expectedAllProducts.filter(p => p.isFeatured);

// --- 3. OS TESTES ---

describe('VitrinePage (Server Component)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProducts.mockResolvedValue(mockApiProducts);
    mockGetAllCategories.mockResolvedValue(mockApiCategories);
    (prisma.catalog.findFirst as jest.Mock).mockResolvedValue({
      id: EXPECTED_CATALOG_ID,
      slug: 'loja-demo'
    });
  });

  it('deve buscar dados, filtrar por "isFeatured", formatar, e passar para o HomeContent', async () => {
    const ui = await VitrinePage();
    render(ui);

    expect(mockGetProducts).toHaveBeenCalledWith(EXPECTED_CATALOG_ID);
    expect(mockGetAllCategories).toHaveBeenCalledWith(EXPECTED_CATALOG_ID);

    expect(mockHomeContent).toHaveBeenCalledWith({
      featuredProducts: expectedFeaturedProducts,
      allProducts: expectedAllProducts,
      allCategories: mockApiCategories,
    });

    expect(screen.getByTestId('mock-page-layout')).toBeInTheDocument();
  });

  it('deve lidar corretamente com o cenário de não haver produtos', async () => {
    mockGetProducts.mockResolvedValue([]);
    mockGetAllCategories.mockResolvedValue(mockApiCategories);

    const ui = await VitrinePage();
    render(ui);

    expect(mockHomeContent).toHaveBeenCalledWith({
      featuredProducts: [],
      allProducts: [],
      allCategories: mockApiCategories,
    });
  });
});