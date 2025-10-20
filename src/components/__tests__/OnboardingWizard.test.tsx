// src/components/__tests__/OnboardingWizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from '../onboarding-wizard';

// 1. Simular o router e o localStorage, tal como fizemos no teste anterior.
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
    // Limpa as simulações antes de cada teste
    mockPush.mockClear();
    mockSetItem.mockClear();
  });

  it('deve permitir que o utilizador complete o fluxo de onboarding', async () => {
    render(<OnboardingWizard />);

    // --- PASSO 1: Identidade do Negócio ---
    // Encontra o campo "Nome do Negócio", preenche-o e clica em "Continuar".
    fireEvent.change(screen.getByLabelText(/Nome do Negócio/i), { target: { value: 'Minha Loja Incrível' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // --- PASSO 2: Criação de Categorias ---
    // Usa 'await findByText' para esperar que o próximo passo apareça na tela.
    await screen.findByText(/Crie as suas Categorias/i);
    fireEvent.change(screen.getByPlaceholderText(/Ex: Bebidas/i), { target: { value: 'Copos Especiais' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // --- PASSO 3: Adicionar Primeiro Produto ---
    // Espera pelo ecrã de adicionar produto. Como os campos não são obrigatórios,
    // apenas clicamos em "Finalizar" para simular o fluxo.
    await screen.findByText(/Adicione o seu Primeiro Produto/i);
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // --- PASSO 4: Conclusão ---
    // Espera pelo ecrã de sucesso e clica no botão final.
    await screen.findByText(/Tudo pronto!/i);
    fireEvent.click(screen.getByRole('button', { name: /Concluir e Ver meu Catálogo/i }));

    // --- VERIFICAÇÕES FINAIS ---
    // Usamos 'waitFor' para garantir que as verificações só são feitas após a conclusão
    // de todas as ações assíncronas (como o clique no botão).
    await waitFor(() => {
      // Verifica se o localStorage foi atualizado corretamente.
      expect(mockSetItem).toHaveBeenCalledWith('onboardingComplete', 'true');

      // Verifica se o utilizador foi redirecionado para a página principal.
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});