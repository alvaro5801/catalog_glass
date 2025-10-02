// src/app/catalogo/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "../../data/products";
import { ProductCard } from "../../components/product-card";
import { Button } from "../../components/ui/button";

export default function CatalogoPage() {
  const allCategories = useMemo(() => [
    "Todos",
    ...new Set(products.map((product) => product.category)),
  ], []);

  const [activeCategory, setActiveCategory] = useState("Todos");
  const searchParams = useSearchParams();

  // Efeito para ler o filtro do URL SOMENTE na primeira vez que a página carrega
  useEffect(() => {
    const categoryFromURL = searchParams.get("categoria");
    if (categoryFromURL) {
      const formattedCategory = categoryFromURL.charAt(0).toUpperCase() + categoryFromURL.slice(1);
      if (allCategories.includes(formattedCategory)) {
        setActiveCategory(formattedCategory);
      }
    }
    // A array de dependências vazia [] garante que isto só corre uma vez
  }, [allCategories, searchParams]);

  // CALCULA os produtos filtrados diretamente, em vez de usar um estado separado
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">Nosso Catálogo</h1>
      <p className="text-muted-foreground text-center mb-10">
        Explore a nossa coleção completa ou filtre por categoria.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-3 text-center text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </p>
        )}
      </div>
    </main>
  );
}