// src/app/catalogo/catalog-content.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "../../data/products";
import { ProductCard } from "../../components/product-card";
import { Button } from "../../components/ui/button";

export function CatalogContent() {
  const allCategories = useMemo(() => [
    "Todos",
    ...new Set(products.map((product) => product.category)),
  ], []);
  
  const [activeCategory, setActiveCategory] = useState("Todos");
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryFromURL = searchParams.get("categoria");
    if (categoryFromURL) {
      const formattedCategory = categoryFromURL.charAt(0).toUpperCase() + categoryFromURL.slice(1);
      if (allCategories.includes(formattedCategory)) {
        setActiveCategory(formattedCategory);
      }
    }
  }, [allCategories, searchParams]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
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
    </>
  );
}