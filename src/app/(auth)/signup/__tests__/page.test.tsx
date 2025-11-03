// src/app/(auth)/signup/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SignUpPage - Página de Cadastro', () => {
  it('deve renderizar todos os campos do formulário', () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument();
  });

  it('deve permitir que o utilizador preencha o formulário', () => {
    render(<SignUpPage />);

    const nameInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar Senha/i);

    fireEvent.change(nameInput, { target: { value: 'Utilizador Teste' } });
    fireEvent.change(emailInput, { target: { value: 'teste@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senhaForte123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'senhaForte123' } });

    expect(nameInput).toHaveValue('Utilizador Teste');
    expect(emailInput).toHaveValue('teste@email.com');
    expect(passwordInput).toHaveValue('senhaForte123');
    expect(confirmPasswordInput).toHaveValue('senhaForte123');
  });

  it('deve exibir uma mensagem de erro se as senhas não corresponderem', async () => {
    render(<SignUpPage />);

    // ✅ CORREÇÃO: Preenchemos TODOS os campos obrigatórios
    const nameInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar Senha/i);
    const submitButton = screen.getByRole('button', { name: /Criar Conta/i });

    // Preenche os campos obrigatórios para que a submissão não seja bloqueada
    fireEvent.change(nameInput, { target: { value: 'Utilizador Válido' } });
    fireEvent.change(emailInput, { target: { value: 'email.valido@teste.com' } });

    // Agora, simula o erro de senhas
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'senha456' } });

    // Clica no botão
    fireEvent.click(submitButton);

    // Agora o teste vai encontrar o alerta com sucesso!
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/As senhas não correspondem/i);
  });
});