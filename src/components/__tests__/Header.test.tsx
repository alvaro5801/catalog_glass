// src/components/__tests__/Header.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../header';

// 1. Simular as dependências (hooks e bibliotecas)
const mockPush = jest.fn();
const mockUsePathname = jest.fn();
const mockSignIn = jest.fn(); // O nosso "espião"

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// ✅ CORREÇÃO DEFINITIVA AQUI:
// Usamos uma função-fábrica que passa os argumentos para o mock.
// Isto evita o ReferenceError e garante que os argumentos são recebidos.
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));

describe('Header Component', () => {

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    mockPush.mockClear();
    mockUsePathname.mockClear();
    mockSignIn.mockClear();
  });

  // Teste 1: Header Público
  it('deve renderizar o header público (do site) na página inicial', () => {
    mockUsePathname.mockReturnValue('/'); // Simula estar na página "/"
    render(<Header />);

    expect(screen.getByAltText(/Logótipo Printa Copos/i)).toBeInTheDocument();
    expect(screen.getByText(/Catálogo/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aceder ao Painel/i })).toBeInTheDocument();

    // O formulário de login NÃO deve estar visível
    expect(screen.queryByPlaceholderText(/E-mail/i)).not.toBeInTheDocument();
  });

  // Teste 2: Header de Login (SaaS)
  it('deve renderizar o formulário de login na página /saas', () => {
    mockUsePathname.mockReturnValue('/saas'); // Simula estar na página "/saas"
    render(<Header />);

    expect(screen.getByPlaceholderText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();

    // O header público NÃO deve estar visível
    expect(screen.queryByAltText(/Logótipo Printa Copos/i)).not.toBeInTheDocument();
  });

  // Teste 3: Fluxo de Login com Sucesso
  it('deve chamar signIn e redirecionar em caso de login com sucesso', async () => {
    mockUsePathname.mockReturnValue('/saas');
    // Simular uma resposta de SUCESSO do signIn
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<Header />);

    // Preencher o formulário
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Esperar que o signIn seja chamado com os dados corretos
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: 'user@test.com',
        password: 'password123',
      });
    });

    // Esperar que o redirecionamento para o "porteiro" ocorra
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login-redirect');
    });

    // Garantir que nenhuma mensagem de erro foi exibida
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Teste 4: Fluxo de Login com Falha
  it('deve exibir uma mensagem de erro em caso de falha no login', async () => {
    mockUsePathname.mockReturnValue('/saas');
    // Simular uma resposta de ERRO do signIn
    mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

    render(<Header />);

    // Preencher o formulário
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Esperar que a mensagem de erro apareça
    const errorMessage = await screen.findByText(/E-mail ou senha inválidos/i);
    expect(errorMessage).toBeInTheDocument();

    // Garantir que NÃO houve redirecionamento
    expect(mockPush).not.toHaveBeenCalled();
  });
});