// src/app/login-redirect/__tests__/page.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import LoginRedirectPage from '../page';

// 1. Simular o router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// 2. Simular a Server Action
const mockGetLoginRedirectUrl = jest.fn();
jest.mock('../actions', () => ({
  getLoginRedirectUrl: () => mockGetLoginRedirectUrl(),
}));

describe('LoginRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve redirecionar sempre para a /vitrine', async () => {
    // A ação agora retorna sempre '/vitrine'
    mockGetLoginRedirectUrl.mockResolvedValue('/vitrine');

    render(<LoginRedirectPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/vitrine');
    });
  });
});