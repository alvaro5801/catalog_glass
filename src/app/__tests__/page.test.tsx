// src/app/__tests__/page.test.tsx

// ✅ CORREÇÃO: Adicionado eslint-disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.setImmediate = ((callback: (...args: any[]) => void, ...args: any[]) => {
  return setTimeout(callback, 0, ...args);
}) as unknown as typeof setImmediate;

import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page'; 
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from '@prisma/client';

// --- MOCKS ---
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

jest.mock('@/domain/repositories/ProductRepository');
jest.mock('@/domain/repositories/CategoryRepository');

// Mock do Prisma para a Home
jest.mock('@/lib/prisma', () => ({
  prisma: {
    catalog: {
      findFirst: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';

jest.mock('@/app/page-layout', () => {
  const MockPageLayout = ({ children }: { children: React.ReactNode }) => <div data-testid="page-layout">{children}</div>;
  MockPageLayout.displayName = 'MockPageLayout';
  return MockPageLayout;
});

const mockHomeContent = jest.fn();
jest.mock('@/app/home-content', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeContent: (props: any) => {
    mockHomeContent(props);
    return <div data-testid="home-content" />;
  },
}));

jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: { href: string, children: React.ReactNode }) => <a href={href}>{children}</a>;
});

// --- DADOS DE TESTE ---
const EXPECTED_ID = 'demo_id';

const mockCategories: PrismaCategory[] = [
  { id: 'c1', name: 'Copos', catalogId: EXPECTED_ID, createdAt: new Date(), updatedAt: new Date() },
];

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

const mockApiProducts: ProductWithRelations[] = [
  {
    id: 'p1',
    slug: 'copo-1',
    name: 'Copo 1',
    images: ['/img.jpg'],
    isFeatured: true,
    categoryId: 'c1',
    specifications: { id: 's1', material: 'Plástico', capacidade: '200ml', dimensoes: '10x10', productId: 'p1' },
    priceTable: [{ id: 'pt1', quantity: '10', price: 5, productId: 'p1' }],
    shortDescription: '',
    description: '',
    priceInfo: '',
    catalogId: EXPECTED_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const expectedFormattedProduct = {
  id: 'p1',
  slug: 'copo-1',
  name: 'Copo 1',
  images: ['/img.jpg'],
  shortDescription: '',
  description: '',
  category: 'Copos',
  specifications: { material: 'Plástico', capacidade: '200ml', dimensoes: '10x10' },
  priceTable: [{ quantity: '10', price: 5 }],
  priceInfo: '',
  isFeatured: true,
};

describe('Home Page (Server Component)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProducts.mockResolvedValue(mockApiProducts);
    mockGetAllCategories.mockResolvedValue(mockCategories);
    (prisma.catalog.findFirst as jest.Mock).mockResolvedValue({ id: EXPECTED_ID, slug: 'demo' });
  });

  it('deve buscar dados e passar para o HomeContent', async () => {
    const ui = await Home();
    render(ui);

    expect(mockHomeContent).toHaveBeenCalledWith({
      featuredProducts: [expectedFormattedProduct],
      allProducts: [expectedFormattedProduct], 
      allCategories: mockCategories,
    });

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });
});