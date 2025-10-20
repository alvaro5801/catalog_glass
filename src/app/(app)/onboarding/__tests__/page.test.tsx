// src/app/(app)/onboarding/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingPage from '../page'; // Importa a tua página de onboarding

// 1. Simular o componente OnboardingWizard
// Criamos um componente falso que renderiza um texto específico para o teste.
jest.mock('@/components/onboarding-wizard', () => ({
  OnboardingWizard: () => <div data-testid="mock-onboarding-wizard">Assistente de Onboarding Mock</div>,
}));

// 2. Simular next/navigation (boa prática para consistência)
// Embora esta página não use diretamente, o wizard usa.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/onboarding', // Simula o pathname
  useSearchParams: () => ({ get: () => '' }),
  notFound: jest.fn(),
}));

describe('OnboardingPage Component', () => {

  it('deve renderizar o componente OnboardingWizard', () => {
    // Renderiza a página OnboardingPage
    render(<OnboardingPage />);

    // Verifica se o nosso componente OnboardingWizard simulado (com o data-testid)
    // está presente no ecrã.
    const wizardMock = screen.getByTestId('mock-onboarding-wizard');
    expect(wizardMock).toBeInTheDocument();

    // Opcionalmente, verifica o texto do mock
    expect(wizardMock).toHaveTextContent('Assistente de Onboarding Mock');
  });

});