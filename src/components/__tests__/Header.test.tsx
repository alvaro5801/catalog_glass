// src/components/__tests__/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../header';

// --- SIMULAÇÕES (MOCKS) ---

// 1. Simular o 'usePathname' (o mais importante)
// Criamos uma função "espiã" que podemos controlar
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  // O useRouter é usado pelos sub-componentes (SignInForm),
  // por isso simulamos para evitar erros.
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// 2. Simular o 'next/link'
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink'; // Para o linter
  return MockLink;
});

// 3. Simular o 'next/image'
jest.mock('next/image', () => {
  const MockImage = (props: React.ComponentProps<'img'>) => <img {...props} alt={props.alt} />;
  MockImage.displayName = 'MockImage'; // Para o linter
  return MockImage;
});

// 4. Simular os formulários e o Sheet (não queremos testá-los aqui)
jest.mock('../sign-in-form', () => ({
  SignInForm: () => <div data-testid="mock-signin-form" />
}));
jest.mock('../sign-in-form-horizontal', () => ({
  SignInFormHorizontal: () => <div data-testid="mock-signin-form-horizontal" />
}));
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// --- FIM DAS SIMULAÇÕES ---

describe('Header Component', () => {

  beforeEach(() => {
    // Limpar o histórico do mock antes de cada teste
    mockUsePathname.mockClear();
  });

  // Teste 1: Cenário da Landing Page
  it('deve renderizar o cabeçalho da Landing Page quando pathname for "/"', () => {
    // Configuração: Simular que estamos na rota '/'
    mockUsePathname.mockReturnValue('/');
    
    render(<Header />);

    // --- O QUE DEVE APARECER ---
    // 1. O logótipo "Printa Copos" que aponta para a raiz
    const logoLink = screen.getByRole('link', { name: /Printa Copos/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');

    // 2. O formulário horizontal (para desktop)
    expect(screen.getByTestId('mock-signin-form-horizontal')).toBeInTheDocument();

    // 3. Os botões "Entrar" e "Cadastre-se" (para mobile)
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cadastre-se/i })).toBeInTheDocument();

    // --- O QUE NÃO DEVE APARECER ---
    // 4. Os links de navegação da app
    expect(screen.queryByRole('link', { name: /Início/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Catálogo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Painel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Sair/i })).not.toBeInTheDocument();
  });

  // Teste 2: Cenário da Aplicação (Vitrine/Catálogo)
  it('deve renderizar o cabeçalho padrão (da app) quando pathname NÃO for "/"', () => {
    // Configuração: Simular que estamos na rota '/vitrine'
    mockUsePathname.mockReturnValue('/vitrine');
    
    render(<Header />);

    // --- O QUE DEVE APARECER ---
    // 1. O logótipo (imagem) que aponta para a /vitrine
    const logoImage = screen.getByAltText(/Logótipo Printa Copos/i);
    expect(logoImage).toBeInTheDocument();
    expect(logoImage.closest('a')).toHaveAttribute('href', '/vitrine');

    // 2. Os links de navegação da app
    expect(screen.getByRole('link', { name: /Início/i })).toHaveAttribute('href', '/vitrine');
    expect(screen.getByRole('link', { name: /Catálogo/i })).toHaveAttribute('href', '/catalogo');
    expect(screen.getByRole('link', { name: /Painel/i })).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.getByRole('link', { name: /Sair/i })).toHaveAttribute('href', '/');

    // --- O QUE NÃO DEVE APARECER ---
    // 3. Os controlos da landing page
    expect(screen.queryByTestId('mock-signin-form-horizontal')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Entrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Cadastre-se/i })).not.toBeInTheDocument();
  });
});