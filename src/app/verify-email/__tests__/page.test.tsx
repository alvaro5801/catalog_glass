// src/app/verify-email/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VerifyEmailPage from '../page'; // O componente que vamos testar

// 1. Dizer ao Jest para usar "timers falsos"
// Isto permite-nos controlar o 'setTimeout' para o teste da nova tentativa e do redirecionamento
jest.useFakeTimers();

// --- SIMULAÇÕES (MOCKS) ---

// 2. Simular o 'fetch' global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 3. Simular o 'next/navigation' (useRouter e useSearchParams)
const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  // O 'useSearchParams' é necessário por causa do Suspense
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

// --- FIM DAS SIMULAÇÕES ---

describe('VerifyEmailPage', () => {

  beforeEach(() => {
    mockFetch.mockClear();
    mockPush.mockClear();
    mockGet.mockClear();
    // Limpar os timers falsos
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Voltar a usar timers reais no final de tudo
    jest.useRealTimers();
  });

  // Teste 1: Sem Email (Erro na URL)
  it('deve mostrar a mensagem de E-mail não encontrado se o email não estiver na URL', async () => {
    mockGet.mockReturnValue(null); // Simula ?email= não existir
    render(<VerifyEmailPage />);
    
    // Espera o Suspense resolver
    const heading = await screen.findByRole('heading', { name: /Erro/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/E-mail não encontrado/i)).toBeInTheDocument();
  });

  // Teste 2: Caminho Feliz (Sucesso na 1ª tentativa)
  it('deve verificar com sucesso na primeira tentativa e redirecionar', async () => {
    mockGet.mockReturnValue('teste@exemplo.com');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'E-mail verificado com sucesso!' }),
    });

    render(<VerifyEmailPage />);

    // Espera o formulário aparecer
    const tokenInput = await screen.findByLabelText(/Código de Verificação/i);
    const submitButton = screen.getByRole('button', { name: /Verificar Conta/i });

    // Ação: Preencher e submeter
    fireEvent.change(tokenInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    // Verificação (Loading):
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Verificação (Fetch):
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify-email', expect.any(Object));
    expect(mockFetch).toHaveBeenCalledTimes(1); // Apenas 1 chamada

    // Verificação (Sucesso):
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/E-mail verificado com sucesso/i);
    });

    // Verificação (Redirect):
    // Avançamos o tempo "falso" em 2 segundos
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockPush).toHaveBeenCalledWith('/saas');
  });

  // Teste 3: Caminho Triste (Código Inválido)
  it('deve mostrar erro se a API retornar um erro (ex: Código inválido)', async () => {
    mockGet.mockReturnValue('teste@exemplo.com');
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Código inválido ou não encontrado.' }),
    });

    render(<VerifyEmailPage />);
    const tokenInput = await screen.findByLabelText(/Código de Verificação/i);
    const submitButton = screen.getByRole('button', { name: /Verificar Conta/i });

    fireEvent.change(tokenInput, { target: { value: '654321' } });
    fireEvent.click(submitButton);

    // Verificação (Erro):
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Código inválido ou não encontrado.');
    });

    // O botão deve voltar ao normal
    expect(submitButton).not.toBeDisabled();
    expect(mockPush).not.toHaveBeenCalled(); // Não deve redirecionar
  });

  // Teste 4: Lógica de Nova Tentativa (O teste principal)
  it('deve tentar novamente se a primeira tentativa falhar com "JSON input" e ter sucesso na segunda', async () => {
    mockGet.mockReturnValue('teste@exemplo.com');
    
    // 1ª Chamada (Falha): Simula o erro de "timeout" do Vercel
    mockFetch.mockImplementationOnce(() => 
      Promise.reject(new Error("Unexpected end of JSON input"))
    );
    // 2ª Chamada (Sucesso):
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: async () => ({ message: 'Sucesso na segunda tentativa!' }),
      })
    );

    render(<VerifyEmailPage />);
    const tokenInput = await screen.findByLabelText(/Código de Verificação/i);
    const submitButton = screen.getByRole('button', { name: /Verificar Conta/i });

    // Ação:
    fireEvent.change(tokenInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    // Verificação 1 (Após 1ª tentativa):
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1); // Fez a 1ª chamada
    });
    // O botão continua desativado e NENHUM erro deve aparecer
    expect(submitButton).toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Ação 2: Avançar 2 segundos no tempo para a nova tentativa
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Verificação 2 (Após 2ª tentativa):
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Fez a 2ª chamada
    });
    
    // Agora o sucesso deve aparecer
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/E-mail verificado com sucesso/i);
    });

    // Verificação 3 (Redirect):
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockPush).toHaveBeenCalledWith('/saas');
  });
});