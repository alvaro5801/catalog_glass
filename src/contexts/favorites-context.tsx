// src/contexts/favorites-context.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';

const FAVORITES_KEY = 'favoriteProducts';

// A interface agora trabalha com 'string'
interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // O estado agora é um array de strings
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Não foi possível ler os favoritos do localStorage", error);
    }
  }, []);

  // O tipo do parâmetro é 'string[]'
  const saveFavorites = (items: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Não foi possível guardar os favoritos no localStorage", error);
    }
  };

  // O tipo do productId é 'string'
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.includes(productId);
      const newFavorites = isFavorite
        ? prevFavorites.filter(id => id !== productId)
        : [...prevFavorites, productId];

      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const value = { favorites, toggleFavorite };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}