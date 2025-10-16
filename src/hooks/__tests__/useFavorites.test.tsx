// src/hooks/__tests__/useFavorites.test.tsx
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { FavoritesProvider, useFavorites } from '@/contexts/favorites-context';

const mockSetItem = jest.fn();
const mockGetItem = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockGetItem(key),
    setItem: (key: string, value: string) => mockSetItem(key, value),
  },
  writable: true,
});

describe('useFavorites Hook (com Contexto)', () => {
  beforeEach(() => {
    mockSetItem.mockClear();
    mockGetItem.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FavoritesProvider>{children}</FavoritesProvider>
  );

  it('deve iniciar com uma lista de favoritos vazia', () => {
    mockGetItem.mockReturnValueOnce(null);
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.favorites).toEqual([]);
  });

  it('deve carregar os favoritos a partir do localStorage ao iniciar', () => {
    const storedFavorites = JSON.stringify([1, 5]);
    mockGetItem.mockReturnValueOnce(storedFavorites);
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.favorites).toEqual([1, 5]);
  });

  it('deve adicionar um novo produto aos favoritos', () => {
    mockGetItem.mockReturnValueOnce(null);
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite(3);
    });

    expect(result.current.favorites).toContain(3);
    expect(mockSetItem).toHaveBeenCalledWith('favoriteProducts', JSON.stringify([3]));
  });

  it('deve remover um produto existente dos favoritos', () => {
    const storedFavorites = JSON.stringify([3, 7]);
    mockGetItem.mockReturnValueOnce(storedFavorites);
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite(3);
    });

    expect(result.current.favorites).toEqual([7]);
    expect(mockSetItem).toHaveBeenCalledWith('favoriteProducts', JSON.stringify([7]));
  });
});
