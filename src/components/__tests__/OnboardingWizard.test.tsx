// src/components/__tests__/OnboardingWizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from '../onboarding-wizard';

// Simular o router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Simular o localStorage (sem alterações)
const mockGetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockGetItem(key),
  },
  writable: true,
});

// Simular o fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;


describe('OnboardingWizard Component', () => {

  beforeEach(() => {
    mockPush.mockClear();
    mockFetch.mockClear();
    mockGetItem.mockClear();
  });

  it('deve permitir que o utilizador complete o fluxo de onboarding', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'catalog-123' }),
    });

    render(<OnboardingWizard />);

    // --- Passos 1, 2, 3 (sem alterações) ---
    fireEvent.change(screen.getByLabelText(/Nome do Negócio/i), { target: { value: 'Minha Loja Incrível' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    await screen.findByText(/Crie as suas Categorias/i);
    fireEvent.change(screen.getByPlaceholderText(/Ex: Bebidas/i), { target: { value: 'Copos Especiais' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    await screen.findByText(/Adicione o seu Primeiro Produto/i);
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // --- Verificação do fetch ---
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/onboarding', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ CORRIGIDO: Incluir imageFile: null no produto esperado
        body: JSON.stringify({
          businessName: 'Minha Loja Incrível',
          categories: ['Copos', 'Canecas', 'Copos Especiais'],
          product: { name: "Copo Long Drink", imageFile: null, price: "9.99" }, // <-- Alteração aqui
        }),
      }));
    });


    // --- Passo 4 (sem alterações) ---
    await screen.findByText(/Tudo pronto!/i);
    fireEvent.click(screen.getByRole('button', { name: /Aceder ao Painel/i }));

    // --- VERIFICAÇÕES FINAIS (sem alterações) ---
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  // Teste de falha da API (sem alterações)
  it('deve exibir uma mensagem de erro se a API falhar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Erro simulado da API.' }),
    });

    render(<OnboardingWizard />);

    // Navegar até ao passo 3
    fireEvent.change(screen.getByLabelText(/Nome do Negócio/i), { target: { value: 'Loja Falha' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    await screen.findByText(/Crie as suas Categorias/i);
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    await screen.findByText(/Adicione o seu Primeiro Produto/i);

    // Clicar em Finalizar
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // Verificar erro
    expect(await screen.findByRole('alert')).toHaveTextContent(/Erro simulado da API./i);
    expect(screen.queryByText(/Tudo pronto!/i)).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

});