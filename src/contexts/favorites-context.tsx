// src/contexts/favorites-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define a interface para o contexto
interface FavoritesContextType {
  favorites: string[]; // Ou o tipo de ID que você usa (ex: number)
  toggleFavorite: (productId: string) => void; // Ou o tipo de ID
}

// Cria o contexto com um valor padrão inicial
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Cria o Provedor do contexto
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    // console.log("Favoritos atualizados:", favorites); // Para debug
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};