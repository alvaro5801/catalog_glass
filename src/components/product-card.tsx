// src/components/product-card.tsx
"use client";

import type { Product } from "../lib/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(product.id);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative group bg-white">
      
      {/* BOTÃO DE FAVORITOS (CORRIGIDO) */}
      <Button
        type="button" // Garante que não tenta submeter nada
        size="icon"
        variant="ghost"
        // Aumentei para z-30 para garantir que está acima do link/imagem
        className="absolute top-2 right-2 z-30 rounded-full h-8 w-8 bg-white/90 hover:bg-white shadow-sm cursor-pointer"
        onClick={(e) => {
          // 🛑 PARA TUDO: Impede que o clique propague para o link ou card
          e.preventDefault();
          e.stopPropagation();
          
          console.log("❤️ Clique no coração! Produto ID:", product.id);
          toggleFavorite(product.id);
        }}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart 
          className={`h-5 w-5 transition-colors duration-200 ${
            isFavorite 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 hover:text-red-500'
          }`} 
        />
      </Button>

      <Link href={`/catalogo/${product.slug}`} className="aspect-square bg-muted overflow-hidden relative block z-0">
        <Image
          src={product.images[0] || ''}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow relative z-0">
        <h3 className="h-14 text-lg font-semibold">
          <Link href={`/catalogo/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <Button size="sm" asChild className="mt-auto self-center">
          <Link href={`/catalogo/${product.slug}`}>Valores</Link>
        </Button>
      </div>
    </div>
  );
}