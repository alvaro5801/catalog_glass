// src/app/catalogo/page.tsx
import { products } from "../../data/products"; // Caminho corrigido
import { ProductCard } from "../../components/product-card";

export default function CatalogoPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Nosso Catálogo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}