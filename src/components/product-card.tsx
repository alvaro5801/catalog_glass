// src/components/product-card.tsx
import type { Product } from "../lib/types";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const startingPrice = product.priceTable[product.priceTable.length - 1].price;

  return (
    // Adicionamos flexbox para controlar o layout interno
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/catalogo/${product.slug}`} className="group flex flex-col h-full">
        {/* Imagem do Produto */}
        <div className="aspect-square bg-muted overflow-hidden relative">
          <Image
            src={product.images[0] || ''} // Usamos a primeira imagem ou uma string vazia
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Adicionamos flexbox aqui também para o conteúdo crescer */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="h-14 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {/* mt-auto empurra o preço para o fundo */}
          <p className="mt-auto pt-2 text-sm text-muted-foreground">
            A partir de R$ {startingPrice.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </Link>
    </div>
  );
}