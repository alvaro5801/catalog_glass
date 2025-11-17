// src/app/(auth)/reset-password/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResetPasswordPage from '../page'; // O componente que vamos testar

// Dizer ao Jest para usar "timers falsos" (para controlar o setTimeout)
jest.useFakeTimers();

// --- SIMULAÇÕES (MOCKS) ---

// 1. Simular o 'fetch' global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 2. Simular o 'next/navigation' (useRouter e useSearchParams)
const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

// 3. Simular o 'next/link' (com displayName para o linter)
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// --- FIM DAS SIMULAÇÕES ---

describe('ResetPasswordPage', () => {

  beforeEach(() => {
    mockFetch.mockClear();
    mockPush.mockClear();
    mockGet.mockClear();
  });

  // Teste 1: Sem Token
  it('deve mostrar a mensagem de Link Inválido se não houver token', () => {
    mockGet.mockReturnValue(null); // Simula ?token= não existir
    render(<ResetPasswordPage />);
    
    expect(screen.getByRole('heading', { name: /Link Inválido/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Nova Senha/i })).not.toBeInTheDocument();
  });

  // Teste 2: Validação (Senhas não batem)
  it('deve mostrar erro de validação se as senhas não coincidirem', async () => {
    mockGet.mockReturnValue('token-valido');
    render(<ResetPasswordPage />);
    
    const passwordInput = screen.getByLabelText(/Nova Senha/i);
    const confirmInput = screen.getByLabelText(/Confirmar Senha/i);
    const submitButton = screen.getByRole('button', { name: /Alterar Senha/i });

    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.change(confirmInput, { target: { value: 'senha456' } });
    fireEvent.click(submitButton);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('As senhas não coincidem.');
    expect(mockFetch).not.toHaveBeenCalled(); // Não deve chamar a API
  });

  // Teste 3: Validação (Senha curta)
  it('deve mostrar erro de validação se a senha for muito curta', async () => {
    mockGet.mockReturnValue('token-valido');
    render(<ResetPasswordPage />);
    
    const passwordInput = screen.getByLabelText(/Nova Senha/i);
    const confirmInput = screen.getByLabelText(/Confirmar Senha/i);
    const submitButton = screen.getByRole('button', { name: /Alterar Senha/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('A senha deve ter pelo menos 6 caracteres.');
    expect(mockFetch).not.toHaveBeenCalled(); // Não deve chamar a API
  });

  // Teste 4: Caminho Feliz (Sucesso)
  it('deve mostrar sucesso e redirecionar após API retornar OK', async () => {
    mockGet.mockReturnValue('token-valido-123');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Senha atualizada com sucesso!' }),
    });

    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText(/Nova Senha/i);
    const confirmInput = screen.getByLabelText(/Confirmar Senha/i);
    const submitButton = screen.getByRole('button', { name: /Alterar Senha/i });

    // Ação:
    fireEvent.change(passwordInput, { target: { value: 'senhasegura123' } });
    fireEvent.change(confirmInput, { target: { value: 'senhasegura123' } });
    fireEvent.click(submitButton);

    // Verificação (Loading):
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Verificação (Fetch):
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'token-valido-123', password: 'senhasegura123' }),
    });
    
    // Verificação (Sucesso):
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Senha Atualizada!/i })).toBeInTheDocument();
    });

    // Verificação (Redirect):
    // Avançamos o tempo "falso" em 3 segundos
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockPush).toHaveBeenCalledWith('/saas');
  });

  // Teste 5: Caminho Triste (Falha da API)
  it('deve mostrar a mensagem de erro da API se a submissão falhar', async () => {
    mockGet.mockReturnValue('token-invalido');
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Token inválido ou expirado.' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/Nova Senha/i), { target: { value: 'tenteiDeNovo123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'tenteiDeNovo123' } });
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }));

    // Verificação (Erro):
    await waitFor(() => {
      // Agora o teste encontra o 'role=alert' que adicionámos ao componente
      expect(screen.getByRole('alert')).toHaveTextContent('Token inválido ou expirado.');
    });

    // O botão deve voltar ao normal
    expect(screen.getByRole('button', { name: /Alterar Senha/i })).not.toBeDisabled();
    expect(mockPush).not.toHaveBeenCalled(); // Não deve redirecionar
  });

});