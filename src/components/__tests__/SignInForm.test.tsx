// src/components/__tests__/SignInForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '../sign-in-form'; // O componente que vamos testar

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

describe('SignInForm Component', () => {

  // Limpamos o histórico das simulações antes de cada teste
  beforeEach(() => {
    mockPush.mockClear();
    mockSignIn.mockClear();
  });

  // Teste 1: Renderização
  it('deve renderizar o formulário e os links corretamente', () => {
    render(<SignInForm />);
    
    // Verifica se os campos de input e botões estão na tela
    expect(screen.getByPlaceholderText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    
    // Verifica se os links de navegação estão corretos
    expect(screen.getByRole('link', { name: /Cadastre-se/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /Esqueceu a senha\?/i })).toHaveAttribute('href', '/forgot-password');
  });

  // Teste 2: Caminho Feliz (Login com Sucesso)
  it('deve chamar signIn e redirecionar em caso de sucesso', async () => {
    // Preparação: Dizemos ao mock do 'signIn' para retornar sucesso
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
    });

    render(<SignInForm />);

    // Ação: Simular o utilizador a preencher o formulário
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@success.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'goodpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (Assert): Usamos 'waitFor' para esperar a função assíncrona
    await waitFor(() => {
      // 1. Verificamos se 'signIn' foi chamado com os dados corretos
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@success.com',
        password: 'goodpass',
        redirect: false,
      });
    });

    await waitFor(() => {
      // 2. Verificamos se o router.push foi chamado para a página correta
      expect(mockPush).toHaveBeenCalledWith('/login-redirect');
    });

    // 3. Verificamos se NENHUMA mensagem de erro apareceu
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Teste 3: Caminho Triste (Login com Falha)
  it('deve mostrar uma mensagem de erro em caso de falha', async () => {
    // Preparação: Dizemos ao mock do 'signIn' para retornar um erro
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'CredentialsSignin', // Erro padrão do NextAuth
    });

    render(<SignInForm />);

    // Ação: Simular o utilizador a preencher com dados errados
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@fail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (Assert):
    await waitFor(() => {
      // 1. Verificamos se 'signIn' foi chamado
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@fail.com',
        password: 'badpass',
        redirect: false,
      });
    });

    await waitFor(() => {
      // 2. Verificamos se a mensagem de erro específica apareceu
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
    });

    // 3. Verificamos se NÃO tentou redirecionar
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Teste 4: Estado de Carregamento (Loading)
  it('deve mostrar o estado de loading durante a submissão', async () => {
    // Preparação: Simular uma resposta lenta
    mockSignIn.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100));
    });

    render(<SignInForm />);

    // Ação:
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), { target: { value: 'user@loading.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), { target: { value: '123' } });
    // O clique é feito no botão com o nome "Entrar"
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificação (Imediata):
    await waitFor(() => {
      // 1. Procuramos o botão APENAS pela 'role'.
      const submitButton = screen.getByRole('button');
      
      // 2. Agora verificamos se o botão (já sem nome) está desativado
      expect(submitButton).toBeDisabled();
      
      // 3. E verificamos se o spinner está DENTRO dele
      expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Verificação (Final): Esperar a promessa resolver
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled(); // Espera o login terminar
    });

    // 3. O estado de loading deve desaparecer
    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    expect(submitButton).not.toBeDisabled();
    expect(submitButton.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
});