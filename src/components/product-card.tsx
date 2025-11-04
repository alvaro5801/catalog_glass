// src/components/product-card.tsx
"use client";
import type { Product } from "../lib/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { useFavorites } from "@/hooks/useFavorites"; // 1. Importar o hook
import { Heart } from "lucide-react"; // 2. Importar o ícone

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 3. Usar o hook para obter a lógica e o estado dos favoritos
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(product.id);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative group">
      {/* 4. Botão de Favoritos */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10 rounded-full h-8 w-8 bg-background/80 hover:bg-background"
        onClick={() => toggleFavorite(product.id)}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
      </Button>

      <Link href={`/catalogo/${product.slug}`} className="aspect-square bg-muted overflow-hidden">
        <Image
          src={product.images[0] || ''}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
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