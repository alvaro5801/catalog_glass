// src/contexts/favorites-context.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';

const FAVORITES_KEY = 'favoriteProducts';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // 1. Carregar ao iniciar
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        console.log("📂 Favoritos carregados do disco:", parsed);
        setFavorites(parsed);
      } else {
        console.log("📂 Nenhum favorito encontrado no disco.");
      }
    } catch (error) {
      console.error("Erro ao ler favoritos:", error);
    }
  }, []);

  // 2. Função para salvar
  const saveFavorites = (items: string[]) => {
    try {
      console.log("💾 A salvar favoritos:", items);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Erro ao salvar favoritos:", error);
    }
  };

  const toggleFavorite = useCallback((productId: string) => {
    if (!productId) {
      console.error("❌ Erro: ID do produto inválido/vazio!");
      return;
    }

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