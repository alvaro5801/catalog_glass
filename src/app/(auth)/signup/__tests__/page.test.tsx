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
    // ✅ CORREÇÃO: Usamos um seletor mais específico que busca o label exato
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument();
  });

  it('deve permitir que o utilizador preencha o formulário', async () => {
    render(<SignUpPage />);

    const nameInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    // ✅ CORREÇÃO: Seletores específicos para cada campo de senha
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

});