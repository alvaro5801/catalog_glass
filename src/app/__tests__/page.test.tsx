// src/app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page'; // A nossa página (agora um Server Component)
import { FavoritesProvider } from '@/contexts/favorites-context'; // ✅ 1. Importar o Provider

// --- Tipos de Dados Similares aos do Prisma (para os nossos mocks) ---
const mockCategories = [
  { id: 'c1', name: 'Copos', catalogId: 'cat123' },
  { id: 'c2', name: 'Taças', catalogId: 'cat123' },
];

const mockProducts = [
  { 
    id: 'p1', 
    name: 'Copo de Teste em Destaque', 
    slug: 'copo-teste', 
    images: ['/img.jpg'], 
    isFeatured: true, // Este vai aparecer
    categoryId: 'c1', 
    priceTable: [], 
    specifications: null, 
    shortDescription: '', 
    description: '', 
    priceInfo: '', 
    catalogId: 'cat123' 
  },
  { 
    id: 'p2', 
    name: 'Taça de Teste Normal', 
    slug: 'taca-teste', 
    images: ['/img.jpg'], 
    isFeatured: false, // Este NÃO vai aparecer na secção de destaques
    categoryId: 'c2', 
    priceTable: [], 
    specifications: null, 
    shortDescription: '', 
    description: '', 
    priceInfo: '', 
    catalogId: 'cat123' 
  },
];

// --- SIMULAR (MOCK) OS SERVIÇOS ---
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

// Mockar os Repositórios (dependências dos serviços)
jest.mock('@/domain/repositories/ProductRepository');
jest.mock('@/domain/repositories/CategoryRepository');


// --- MOCKS DE UI E HOOKS (Mantêm-se) ---
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-item">{children}</div>,
  CarouselNext: () => <button>Next</button>,
  CarouselPrevious: () => <button>Previous</button>,
}));
jest.mock('../page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => ({ current: null })),
}));
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useScroll: jest.fn(() => ({ scrollYProgress: { get: () => 0, onChange: () => {} } })),
  useTransform: jest.fn(() => ({ get: () => '0%', onChange: () => {} })), // Simplificado
  motion: {
    div: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>)
  }
}));
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: { href: string, children: React.ReactNode }) => {
    return <a href={href}>{children}</a>;
  };
});
// Em: src/app/__tests__/page.test.tsx
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'> & { fill?: boolean }) => {
    // ✅ Adicionamos este comentário para ignorar o aviso de 'variável não usada'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill: _fill, ...rest } = props; 
    
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={props.alt || ""} />; 
  },
}));


// --- OS TESTES ATUALIZADOS ---
describe('Home Page (Server Component)', () => {
  
  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    mockGetProducts.mockClear();
    mockGetAllCategories.mockClear();
    (React.useRef as jest.Mock).mockClear();
    (jest.requireMock('framer-motion').useScroll as jest.Mock).mockClear();
    (jest.requireMock('framer-motion').useTransform as jest.Mock).mockClear();
  });

  it('deve renderizar os elementos principais, produtos e categorias dos serviços', async () => {
    // 1. Preparação: Dizer aos mocks o que devem retornar
    mockGetProducts.mockResolvedValue(mockProducts);
    mockGetAllCategories.mockResolvedValue(mockCategories);

    // 2. Execução: Chamar o Server Component (que agora é async)
    const resolvedComponent = await Home();
    
    // ✅ 2. CORREÇÃO: Embrulhar o componente no Provider
    render(<FavoritesProvider>{resolvedComponent}</FavoritesProvider>);

    // 3. Verificação:
    // Títulos principais
    expect(screen.getByRole('heading', { level: 1, name: /Transforme Momentos em Memórias/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar Catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Personalize em Apenas 3 Passos/i })).toBeInTheDocument();

    // Verificar produtos em destaque
    expect(screen.getByRole('heading', { name: /Produtos em Destaque/i })).toBeInTheDocument();
    expect(screen.getByText('Copo de Teste em Destaque')).toBeInTheDocument();
    expect(screen.queryByText('Taça de Teste Normal')).not.toBeInTheDocument();

    // Verificar categorias
    expect(screen.getByRole('heading', { name: /Navegue por Categoria/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Copos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Taças/i })).toBeInTheDocument();
  });

  it('não deve renderizar a secção de destaques se nenhum produto for destacado', async () => {
    // 1. Preparação: Simular que os produtos vêm sem 'isFeatured: true'
    const nonFeaturedProducts = mockProducts.map(p => ({ ...p, isFeatured: false }));
    mockGetProducts.mockResolvedValue(nonFeaturedProducts);
    mockGetAllCategories.mockResolvedValue(mockCategories);

    // 2. Execução:
    const resolvedComponent = await Home();
    
    // ✅ 3. CORREÇÃO: Embrulhar o componente no Provider
    render(<FavoritesProvider>{resolvedComponent}</FavoritesProvider>);

    // 3. Verificação:
    // O título da secção de destaques não deve existir
    expect(screen.queryByRole('heading', { name: /Produtos em Destaque/i })).not.toBeInTheDocument();
  });
});