// src/app/catalogo/catalog-content.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/product-card";
import { Button } from "../../components/ui/button";
import type { Product } from "@/lib/types"; // Nosso tipo de frontend
import type { Category as PrismaCategory } from "@prisma/client"; // Tipo do Prisma

export function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(["Todos"]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("Todos");
  const searchParams = useSearchParams();

  // ✅ ALTERAÇÃO: Usar useEffect para buscar dados reais da API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'), // Busca da nossa nova API de produtos
          fetch('/api/categories') // Busca da nossa nova API de categorias
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Falha ao carregar os dados do catálogo.");
        }

        const productsData = await productsRes.json();
        const categoriesData: PrismaCategory[] = await categoriesRes.json();

        // Mapear os dados para o formato que o frontend espera
        const formattedProducts = productsData.map((p: any) => ({ ...p, category: p.categoryId }));
        const categoryNames = categoriesData.map((c) => c.name);

        setProducts(formattedProducts);
        setAllCategories(["Todos", ...categoryNames]);

      } catch (error) {
        console.error("Falha ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // O resto do componente continua igual...

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
    // Lembre-se que o 'category' no nosso tipo 'Product' agora corresponde ao 'categoryId'
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  if (isLoading) {
    return <p className="text-center text-muted-foreground animate-pulse">A carregar catálogo...</p>;
  }

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