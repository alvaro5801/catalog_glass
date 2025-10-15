// src/components/__tests__/OnboardingWizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from '../onboarding-wizard';

// --- Mock do 'useRouter' do Next.js ---
// Precisamos de simular o router para que o teste não falhe ao tentar navegar.
const mockPush = jest.fn(); // Cria uma função "espiã" para observar se a navegação é chamada
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// --- Mock do 'localStorage' ---
// A função `localStorage.setItem` também precisa ser simulada no ambiente de teste.
const mockSetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: (...args: [string, string]) => mockSetItem(...args),
  },
  writable: true,
});


describe('OnboardingWizard Component', () => {

  // Limpa os mocks antes de cada teste para garantir que os testes sejam independentes
  beforeEach(() => {
    mockPush.mockClear();
    mockSetItem.mockClear();
  });

  it('deve permitir que o utilizador complete o fluxo de onboarding', async () => {
    render(<OnboardingWizard />);

    // --- Passo 1: Identidade do Negócio ---
    expect(screen.getByText(/Qual é a identidade do seu negócio?/i)).toBeInTheDocument();
    
    // Simula o utilizador a escrever no campo "Nome do Negócio"
    const businessNameInput = screen.getByLabelText(/Nome do Negócio/i);
    fireEvent.change(businessNameInput, { target: { value: 'Minha Loja Incrível' } });

    // Simula o clique no botão "Continuar"
    const continueButtonStep1 = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(continueButtonStep1);

    // --- Passo 2: Categorias ---
    // Usamos 'await' e 'findByText' para esperar que o próximo passo apareça na tela
    await screen.findByText(/Crie as suas Categorias/i);
    
    const categoryInput = screen.getByPlaceholderText(/Ex: Bebidas/i);
    fireEvent.change(categoryInput, { target: { value: 'Copos Especiais' } });

    const addCategoryButton = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addCategoryButton);
    
    // Verifica se a categoria foi adicionada à lista
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

    // Verificamos se o localStorage foi chamado para marcar o onboarding como completo
    expect(mockSetItem).toHaveBeenCalledWith('onboardingComplete', 'true');

    // Verificamos se a função 'push' do router foi chamada para levar o utilizador à página inicial
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});