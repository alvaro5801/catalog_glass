// src/components/__tests__/OnboardingWizard.test.tsx
import React from 'react';
// O que foi corrigido: 'waitFor' foi removido da linha abaixo.
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingWizard } from '../onboarding-wizard';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockSetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: (key: string, value: string) => mockSetItem(key, value),
  },
  writable: true,
});

describe('OnboardingWizard Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSetItem.mockClear();
  });

  it('deve permitir que o utilizador complete o fluxo de onboarding', async () => {
    render(<OnboardingWizard />);

    // Passo 1
    fireEvent.change(screen.getByLabelText(/Nome do Negócio/i), { target: { value: 'Minha Loja Incrível' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Passo 2
    await screen.findByText(/Crie as suas Categorias/i);
    fireEvent.change(screen.getByPlaceholderText(/Ex: Bebidas/i), { target: { value: 'Copos Especiais' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Passo 3
    await screen.findByText(/Adicione o seu Primeiro Produto/i);
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // Passo 4
    await screen.findByText(/Tudo pronto!/i);
    fireEvent.click(screen.getByRole('button', { name: /Concluir e Ver meu Catálogo/i }));

    // Verificações Finais
    // O 'waitFor' não é necessário aqui porque o 'findBy' já espera e o clique final
    // não tem mais atualizações de estado assíncronas para esperar no teste.
    expect(mockSetItem).toHaveBeenCalledWith('onboardingComplete', 'true');
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});