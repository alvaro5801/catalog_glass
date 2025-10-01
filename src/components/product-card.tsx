// src/components/product-card.tsx
import type { Product } from "../lib/types"; // Caminho corrigido
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const startingPrice = product.priceTable[product.priceTable.length - 1].price;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <Link href={`/catalogo/${product.slug}`} className="group">
        <div className="aspect-square bg-muted flex items-center justify-center">
          <span className="text-sm text-gray-500">Imagem do Produto</span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            A partir de R$ {startingPrice.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </Link>
    </div>
  );
}