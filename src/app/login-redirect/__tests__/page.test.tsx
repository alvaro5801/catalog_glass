// src/app/login-redirect/__tests__/page.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import LoginRedirectPage from '../page';

// 1. Simular o router do Next.js
// Precisamos de controlar a função `push` para verificar se ela é chamada com o URL correto.
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Simular o localStorage do browser
// Os testes são executados num ambiente que não tem localStorage, por isso criamos uma simulação.
let mockLocalStorage: { [key: string]: string } = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockLocalStorage[key] = value;
    },
    clear: () => {
      mockLocalStorage = {};
    }
  },
  writable: true,
});


describe('LoginRedirectPage', () => {

  // Limpa as simulações antes de cada teste para garantir que são independentes.
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  it('deve redirecionar para /onboarding se o onboarding não estiver completo', async () => {
    // Cenário: localStorage está vazio ou 'onboardingComplete' é 'false'.
    render(<LoginRedirectPage />);

    // Usamos 'waitFor' para esperar que o useEffect dentro do componente seja executado.
    await waitFor(() => {
      // Verificamos se a função 'push' foi chamada com o URL do onboarding.
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('deve redirecionar para / se o onboarding estiver completo', async () => {
    // Cenário: Marcamos o onboarding como completo no nosso localStorage simulado.
    localStorage.setItem('onboardingComplete', 'true');

    render(<LoginRedirectPage />);

    await waitFor(() => {
      // Verificamos se a função 'push' foi chamada com o URL da página principal.
      // A lógica atual redireciona para '/', o que está correto para o site público.
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});