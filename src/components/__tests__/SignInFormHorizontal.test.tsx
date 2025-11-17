// src/components/__tests__/SignInFormHorizontal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInFormHorizontal } from '../sign-in-form-horizontal';

// --- SIMULAÇÕES (MOCKS) ---

// 1. Simular o 'next/navigation'
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Simular o 'next-auth/react'
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  // ✅ CORREÇÃO 1: Desativamos a regra 'no-explicit-any' para esta linha
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (provider: string, options: any) => mockSignIn(provider, options),
}));

// 3. Simular o 'next/link'
// ✅ CORREÇÃO 2: Damos um nome (displayName) ao nosso componente de simulação
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// --- FIM DAS SIMULAÇÕES ---

describe('SignInFormHorizontal Component', () => {

  // Limpamos o histórico das simulações antes de cada teste
  beforeEach(() => {
    mockPush.mockClear();
    mockSignIn.mockClear();
  });

  // Teste 1: Renderização
  it('deve renderizar o formulário e os links corretamente', () => {
    render(<SignInFormHorizontal />);
    
    // O resto é igual
    expect(screen.getByPlaceholderText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: /Cadastre-se/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /Esqueceu a senha\?/i })).toHaveAttribute('href', '/forgot-password');
  });

  // Teste 2: Caminho Feliz (Login com Sucesso)
  it('deve chamar signIn e redirecionar em caso de sucesso', async () => {
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
    });

    render(<SignInFormHorizontal />);

    // Ação (igual)
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@success.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'goodpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (igual)
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@success.com',
        password: 'goodpass',
        redirect: false,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login-redirect');
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Teste 3: Caminho Triste (Login com Falha)
  it('deve mostrar uma mensagem de erro em caso de falha', async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'CredentialsSignin',
    });

    render(<SignInFormHorizontal />);

    // Ação (igual)
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@fail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (igual)
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@fail.com',
        password: 'badpass',
        redirect: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  // Teste 4: Estado de Carregamento (Loading)
  it('deve mostrar o estado de loading durante a submissão', async () => {
    mockSignIn.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100));
    });

    render(<SignInFormHorizontal />);

    // Ação (igual)
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@loading.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (igual, com a correção de 'role')
    await waitFor(() => {
      const submitButton = screen.getByRole('button');
      
      expect(submitButton).toBeDisabled();
      expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Verificação (Final)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled(); 
    });

    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    expect(submitButton).not.toBeDisabled();
    expect(submitButton.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
});