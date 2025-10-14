// src/components/product-card.tsx
import type { Product } from "../lib/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // A linha que declarava a variável 'startingPrice' foi completamente removida.

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/catalogo/${product.slug}`} className="group aspect-square bg-muted overflow-hidden relative">
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