// src/contexts/favorites-context.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

// A chave que usaremos para guardar os dados no localStorage
const FAVORITES_KEY = 'favoriteProducts';

// 1. Definir a estrutura do nosso Contexto
interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (productId: number) => void;
}

// 2. Criar o Contexto
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// 3. Criar o Provedor (o componente que vai "segurar" o estado)
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Carrega os favoritos do localStorage quando o componente é montado
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

  // Salva os favoritos no localStorage sempre que o estado 'favorites' muda
  const saveFavorites = (items: number[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Não foi possível guardar os favoritos no localStorage", error);
    }
  };

  // A função para adicionar/remover favoritos
  const toggleFavorite = useCallback((productId: number) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.includes(productId);
      const newFavorites = isFavorite
        ? prevFavorites.filter(id => id !== productId)
        : [...prevFavorites, productId];

      saveFavorites(newFavorites); // Guarda no localStorage
      return newFavorites;
    });
  }, []);

  // O valor que será partilhado com todos os componentes-filho
  const value = { favorites, toggleFavorite };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 4. Criar um hook personalizado para consumir o contexto facilmente
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}