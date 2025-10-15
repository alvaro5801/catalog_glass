// src/components/__tests__/OnboardingWizard.test.tsx
import React from 'react';
// ✅ CORREÇÃO: 'waitFor' foi removido da importação.
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingWizard } from '../onboarding-wizard';

// --- Mock do 'useRouter' do Next.js ---
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// --- Mock do 'localStorage' ---
const mockSetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: (...args: [string, string]) => mockSetItem(...args),
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

    // --- Passo 1: Identidade do Negócio ---
    expect(screen.getByText(/Qual é a identidade do seu negócio?/i)).toBeInTheDocument();
    
    const businessNameInput = screen.getByLabelText(/Nome do Negócio/i);
    fireEvent.change(businessNameInput, { target: { value: 'Minha Loja Incrível' } });

    const continueButtonStep1 = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(continueButtonStep1);

    // --- Passo 2: Categorias ---
    await screen.findByText(/Crie as suas Categorias/i);
    
    const categoryInput = screen.getByPlaceholderText(/Ex: Bebidas/i);
    fireEvent.change(categoryInput, { target: { value: 'Copos Especiais' } });

    const addCategoryButton = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addCategoryButton);
    
    expect(screen.getByText('Copos Especiais')).toBeInTheDocument();

    const continueButtonStep2 = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(continueButtonStep2);

    // --- Passo 3: Adicionar Produto ---
    await screen.findByText(/Adicione o seu Primeiro Produto/i);

    const finishButton = screen.getByRole('button', { name: /Finalizar/i });
    fireEvent.click(finishButton);
    
    // --- Passo 4: Conclusão ---
    await screen.findByText(/Tudo pronto!/i);
    expect(screen.getByText(/O seu catálogo foi criado com sucesso./i)).toBeInTheDocument();

    // --- Ação Final: Redirecionamento ---
    const conclusionButton = screen.getByRole('button', { name: /Concluir e Ver meu Catálogo/i });
    fireEvent.click(conclusionButton);

    expect(mockSetItem).toHaveBeenCalledWith('onboardingComplete', 'true');
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});