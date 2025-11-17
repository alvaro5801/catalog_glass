// src/app/vitrine/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import VitrinePage from '../page'; // O Server Component que vamos testar
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

// 1.2. Simular os Repositórios (necessários para as instâncias no componente)
jest.mock('@/domain/repositories/ProductRepository');
jest.mock('@/domain/repositories/CategoryRepository');

// 1.3. Simular o PageLayout (para verificar se o conteúdo está dentro dele)
jest.mock('@/app/page-layout', () => {
  const MockPageLayout = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-page-layout">{children}</div>;
  };
  MockPageLayout.displayName = 'MockPageLayout';
  return MockPageLayout;
});

// 1.4. Simular o HomeContent (O ALVO do nosso teste)
// Criamos um "espião" (spy) para capturar as props
const mockHomeContent = jest.fn();
jest.mock('@/app/home-content', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeContent: (props: any) => {
    mockHomeContent(props);
    return <div data-testid="mock-home-content">Conteúdo da Home</div>;
  },
}));

// 1.5. Simular o next/navigation (usado por PageLayout -> Header)
jest.mock('next/navigation', () => ({
  usePathname: () => '/vitrine',
  useRouter: () => ({ push: jest.fn() }),
}));

// --- 2. DADOS DE TESTE ---

// 2.1. Dados que simulamos vir dos Serviços
const mockApiCategories: PrismaCategory[] = [
  { id: 'cat-1', name: 'Copos', catalogId: 'clx...46c', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', name: 'Taças', catalogId: 'clx...46c', createdAt: new Date(), updatedAt: new Date() },
];

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

const mockApiProducts: ProductWithRelations[] = [
  // Produto 1: Em destaque (deve aparecer)
  {
    id: 'prod-1',
    slug: 'copo-destaque',
    name: 'Copo Destaque',
    images: ['/img1.jpg'],
    isFeatured: true, // ✅
    categoryId: 'cat-1',
    specifications: { id: 's1', material: 'Acrílico', capacidade: '300ml', dimensoes: '10cm', productId: 'prod-1' },
    priceTable: [{ id: 'p1', quantity: '100', price: 5, productId: 'prod-1' }],
    shortDescription: 'curta',
    description: 'longa',
    priceInfo: 'info',
    catalogId: 'clx...46c',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Produto 2: Não está em destaque (deve ser filtrado)
  {
    id: 'prod-2',
    slug: 'taca-comum',
    name: 'Taça Comum',
    images: ['/img2.jpg'],
    isFeatured: false, // ❌
    categoryId: 'cat-2',
    specifications: { id: 's2', material: 'Vidro', capacidade: '500ml', dimensoes: '20cm', productId: 'prod-2' },
    priceTable: [{ id: 'p2', quantity: '50', price: 15, productId: 'prod-2' }],
    shortDescription: 'curta 2',
    description: 'longa 2',
    priceInfo: 'info 2',
    catalogId: 'clx...46c',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Produto 3: Em destaque, mas com dados em falta (testar formatação)
  {
    id: 'prod-3',
    slug: 'caneca-destaque',
    name: 'Caneca Destaque',
    images: ['/img3.jpg'],
    isFeatured: true, // ✅
    categoryId: 'cat-99', // Categoria que não existe
    specifications: null, // Specs em falta
    priceTable: [],
    
    // ✅ CORREÇÃO AQUI: Trocamos null por "" (string vazia)
    shortDescription: "",
    description: "",
    priceInfo: "",
    
    catalogId: 'clx...46c',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 2.2. Dados que esperamos que o HomeContent receba (APÓS A LÓGICA do componente)
const expectedFormattedProducts = [
  {
    id: 'prod-1',
    slug: 'copo-destaque',
    name: 'Copo Destaque',
    images: ['/img1.jpg'],
    shortDescription: 'curta',
    description: 'longa',
    category: 'Copos', // Nome da Categoria (não o ID)
    specifications: { material: 'Acrílico', capacidade: '300ml', dimensoes: '10cm' },
    priceTable: [{ quantity: '100', price: 5 }],
    priceInfo: 'info',
    isFeatured: true,
  },
  {
    id: 'prod-3',
    slug: 'caneca-destaque',
    name: 'Caneca Destaque',
    images: ['/img3.jpg'],
    shortDescription: '', // Deve ser string vazia
    description: '', // Deve ser string vazia
    category: 'N/A', // Categoria default
    specifications: { material: '', capacidade: '', dimensoes: '' }, // Specs default
    priceTable: [],
    priceInfo: '', // Deve ser string vazia
    isFeatured: true,
  },
];


// --- 3. OS TESTES ---

describe('VitrinePage (Server Component)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão: retornar os dados completos
    mockGetProducts.mockResolvedValue(mockApiProducts);
    mockGetAllCategories.mockResolvedValue(mockApiCategories);
  });

  it('deve buscar dados, filtrar por "isFeatured", formatar, e passar para o HomeContent', async () => {
    
    // 1. Executar o Server Component (como uma função async)
    const ui = await VitrinePage();
    
    // 2. Renderizar o JSX que ele retornou
    render(ui);

    // 3. Verificar se os Mocks dos serviços foram chamados corretamente
    expect(mockGetProducts).toHaveBeenCalledWith("clxrz8hax00003b6khe69046c");
    expect(mockGetAllCategories).toHaveBeenCalledWith("clxrz8hax00003b6khe69046c");

    // 4. Verificar se o HomeContent (nosso espião) foi chamado
    expect(mockHomeContent).toHaveBeenCalledTimes(1);

    // 5. A VERIFICAÇÃO PRINCIPAL:
    // O HomeContent recebeu as props corretas (filtradas e formatadas)?
    expect(mockHomeContent).toHaveBeenCalledWith({
      featuredProducts: expectedFormattedProducts, // Apenas os 2 produtos formatados
      allCategories: mockApiCategories,           // Todas as categorias (para os ícones)
    });

    // 6. Verificar se tudo está dentro do PageLayout
    expect(screen.getByTestId('mock-page-layout')).toBeInTheDocument();
  });

  it('deve lidar corretamente com o cenário de não haver produtos', async () => {
    // Preparação: Serviços não retornam produtos
    mockGetProducts.mockResolvedValue([]);
    mockGetAllCategories.mockResolvedValue(mockApiCategories);

    // Execução
    const ui = await VitrinePage();
    render(ui);

    // Verificação: HomeContent deve ser chamado com um array vazio
    expect(mockHomeContent).toHaveBeenCalledWith({
      featuredProducts: [], // Array vazio
      allCategories: mockApiCategories,
    });
  });
});