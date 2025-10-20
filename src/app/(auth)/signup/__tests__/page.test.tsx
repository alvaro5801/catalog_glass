// src/app/(auth)/signup/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from '../page'; // O componente que estamos a testar

// 1. Simular o fetch e o router
const mockPush = jest.fn();
global.fetch = jest.fn() as jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Criar uma função para preencher o formulário
const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Utilizador Teste' } });
  fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'teste@email.com' } });
  fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'senhaForte123' } });
  fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'senhaForte123' } });
};

describe('SignUpPage - Página de Cadastro', () => {

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar todos os campos do formulário', () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro se as senhas não corresponderem', async () => {
    render(<SignUpPage />);

    // Preenche o formulário com senhas diferentes
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Utilizador Teste' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'senha456' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    // Verifica se a mensagem de erro do frontend aparece
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/As senhas não correspondem/i);
    expect(global.fetch).not.toHaveBeenCalled(); // A API não deve ser chamada
    expect(mockPush).not.toHaveBeenCalled(); // O router não deve ser chamado
  });

  // 3. NOVO TESTE: Sucesso no registo
  it('deve submeter o formulário e redirecionar em caso de sucesso', async () => {
    // Simular uma resposta de sucesso da API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123', name: 'Utilizador Teste', email: 'teste@email.com' }),
    });

    render(<SignUpPage />);
    fillForm(); // Preenche o formulário com dados válidos
    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    // Esperar que o fetch seja chamado com os dados corretos
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Utilizador Teste',
          email: 'teste@email.com',
          password: 'senhaForte123',
        }),
      });
    });

    // Esperar que o redirecionamento ocorra
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/saas?status=signup-success');
    });

    // Garantir que nenhuma mensagem de erro foi exibida
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // 4. NOVO TESTE: Erro da API (ex: e-mail duplicado)
  it('deve exibir uma mensagem de erro vinda da API', async () => {
    // Simular uma resposta de erro (409 Conflict) da API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Este e-mail já está em uso.' }),
    });

    render(<SignUpPage />);
    fillForm(); // Preenche o formulário com dados válidos
    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    // Esperar que a mensagem de erro da API seja exibida
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Este e-mail já está em uso./i);

    // Garantir que não houve redirecionamento
    expect(mockPush).not.toHaveBeenCalled();
  });
});