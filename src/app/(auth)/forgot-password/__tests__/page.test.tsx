// src/app/(auth)/forgot-password/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../page'; // O componente que vamos testar

// --- SIMULAÇÕES (MOCKS) ---

// 1. Simular o 'fetch' global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 2. Simular o 'next/link'
// ✅ CORREÇÃO: Damos um nome (displayName) ao nosso componente de simulação
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// --- FIM DAS SIMULAÇÕES ---

describe('ForgotPasswordPage', () => {

  // Limpamos o histórico do fetch antes de cada teste
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Teste 1: Renderização
  it('deve renderizar o formulário inicial corretamente', () => {
    render(<ForgotPasswordPage />);
    
    // Verifica o título e o texto
    expect(screen.getByRole('heading', { name: /Recuperar Senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    
    // Verifica o botão de submissão
    expect(screen.getByRole('button', { name: /Enviar Link de Recuperação/i })).toBeInTheDocument();
    
    // Verifica o link para voltar
    expect(screen.getByRole('link', { name: /Voltar ao login/i })).toHaveAttribute('href', '/saas');
  });

  // Teste 2: Caminho Feliz (Submissão com Sucesso)
  it('deve mostrar a mensagem de sucesso após submeter um email válido', async () => {
    // Preparação: Mock do fetch para retornar sucesso
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Se o e-mail existir, enviámos um link.' }),
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Link de Recuperação/i });

    // Ação: Simular o preenchimento e clique
    fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } });
    fireEvent.click(submitButton);

    // Verificação (Loading):
    await waitFor(() => {
      // O botão deve estar desativado e mostrar o spinner
      expect(submitButton).toBeDisabled();
      expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Verificação (Sucesso):
    await waitFor(() => {
      // O formulário deve desaparecer e a mensagem de sucesso deve aparecer
      expect(screen.getByRole('heading', { name: /Verifique o seu e-mail/i })).toBeInTheDocument();
      expect(screen.getByText(/Se existir uma conta com o e-mail/i)).toBeInTheDocument();
      expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument();
    });

    // Verifica se o fetch foi chamado corretamente
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@exemplo.com' }),
    });
  });

  // Teste 3: Caminho Triste (Submissão com Falha)
  it('deve mostrar uma mensagem de erro se a API falhar', async () => {
    // Preparação: Mock do fetch para retornar um erro
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Ocorreu um erro.' }),
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Link de Recuperação/i });

    // Ação:
    fireEvent.change(emailInput, { target: { value: 'erro@exemplo.com' } });
    fireEvent.click(submitButton);

    // Verificação (Loading):
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Verificação (Erro):
    await waitFor(() => {
      // O formulário *não* deve desaparecer
      expect(screen.getByRole('heading', { name: /Recuperar Senha/i })).toBeInTheDocument();
      
      // A mensagem de erro deve aparecer (Isto agora vai funcionar por causa da correção que fizemos no ficheiro .tsx)
      expect(screen.getByRole('alert')).toHaveTextContent('Ocorreu um erro.');
    });

    // O botão de loading deve voltar ao normal
    expect(submitButton).not.toBeDisabled();
  });
});