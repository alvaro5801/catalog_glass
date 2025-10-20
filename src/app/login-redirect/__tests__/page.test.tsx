import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import LoginRedirectPage from '../page';

// --- Mock do router ---
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// --- Mock do useSession ---
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

describe('LoginRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1️⃣ Estado de carregamento
  it('deve exibir a mensagem de carregamento e não redirecionar imediatamente', async () => {
    mockUseSession.mockReturnValue({ status: 'loading', data: null });

    render(<LoginRedirectPage />);
    expect(screen.getByText(/A autenticar.../i)).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  // 2️⃣ Redirecionar para /onboarding
  it('deve redirecionar para /onboarding se autenticado mas o onboarding não está completo', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123', onboardingComplete: false } },
    });

    render(<LoginRedirectPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  // 3️⃣ Redirecionar para /admin/dashboard
  it('deve redirecionar para /admin/dashboard se autenticado e o onboarding está completo', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123', onboardingComplete: true } },
    });

    render(<LoginRedirectPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  // 4️⃣ Redirecionar para /saas
  it('deve redirecionar para /saas se não autenticado', async () => {
    mockUseSession.mockReturnValue({ status: 'unauthenticated', data: null });

    render(<LoginRedirectPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/saas');
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
