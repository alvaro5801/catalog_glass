// src/components/__tests__/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../header';

// --- SIMULAÇÕES (MOCKS) ---

const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  // ✅ CORREÇÃO: Ignorar aviso de otimização de imagem
  // eslint-disable-next-line @next/next/no-img-element
  const MockImage = (props: React.ComponentProps<'img'>) => <img {...props} alt={props.alt} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

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
    mockUsePathname.mockClear();
  });

  it('deve renderizar o cabeçalho da Landing Page quando pathname for "/"', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /Catalogg/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');

    expect(screen.getByTestId('mock-signin-form-horizontal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cadastre-se/i })).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: /Início/i })).not.toBeInTheDocument();
  });

  it('deve renderizar o cabeçalho padrão (da app) quando pathname NÃO for "/"', () => {
    mockUsePathname.mockReturnValue('/vitrine');
    render(<Header />);

    const logoImage = screen.getByAltText(/Logótipo Catalogg/i);
    expect(logoImage).toBeInTheDocument();
    expect(logoImage.closest('a')).toHaveAttribute('href', '/vitrine');

    expect(screen.getByRole('link', { name: /Início/i })).toHaveAttribute('href', '/vitrine');
    expect(screen.getByRole('link', { name: /Catálogo/i })).toHaveAttribute('href', '/catalogo');
    expect(screen.getByRole('link', { name: /Painel/i })).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.getByRole('link', { name: /Sair/i })).toHaveAttribute('href', '/');

    expect(screen.queryByTestId('mock-signin-form-horizontal')).not.toBeInTheDocument();
  });
});