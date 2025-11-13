// src/app/login-redirect/__tests__/page.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import LoginRedirectPage from '../page';

// 1. Simular o router do Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Simular o localStorage do browser
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

  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  it('deve redirecionar para /onboarding se o onboarding não estiver completo', async () => {
    // Cenário: localStorage está vazio ou 'onboardingComplete' é 'false'.
    render(<LoginRedirectPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('deve redirecionar para /admin/dashboard se o onboarding estiver completo', async () => {
    // Cenário: Marcamos o onboarding como completo
    localStorage.setItem('onboardingComplete', 'true');

    render(<LoginRedirectPage />);

    await waitFor(() => {
      // ✅ CORREÇÃO: Agora esperamos que vá para o Painel Administrativo
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});