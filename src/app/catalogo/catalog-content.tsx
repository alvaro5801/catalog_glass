// src/app/catalogo/catalog-content.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/product-card";
import { Button } from "../../components/ui/button";
import type { Product } from "@/lib/types"; // Nosso tipo de frontend
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client"; // Tipos do Prisma

type ProductFromApi = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

export function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(["Todos"]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("Todos");
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Falha ao carregar os dados do catálogo.");
        }

        const productsData: ProductFromApi[] = await productsRes.json();
        const categoriesData: PrismaCategory[] = await categoriesRes.json();

        // ✅ CORREÇÃO AQUI:
        // Verificamos se 'p.specifications' existe. Se não existir (for null),
        // criamos um objeto de especificações com valores padrão.
        // Isto garante que o objeto final corresponde sempre ao tipo 'Product'.
        const formattedProducts = productsData.map((p: ProductFromApi) => ({
          ...p,
          // Nota: O tipo 'Product' espera 'category' como string (id), o que está correto.
          category: p.categoryId, 
          specifications: p.specifications ?? { material: '', capacidade: '', dimensoes: '' },
        }));

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
    // Usamos 'product.category' que agora é o 'categoryId' (string)
    return products.filter((product) => {
        // Encontramos o nome da categoria do produto para comparar
        const categoryName = allCategories.find(name => 
            categoriesData.find(c => c.name === name)?.id === product.category
        );
        return categoryName === activeCategory;
    });
    // ✅ CORREÇÃO: A lógica do filtro precisa de ser ajustada para comparar o ID
    // Vamos simplificar. O filtro deve comparar o NOME da categoria.
    // O objeto 'formattedProducts' precisa de ter o NOME da categoria, não o ID.
    
    // Vamos corrigir a formatação de dados no 'fetchData'
  }, [activeCategory, products, allCategories]);

  // Se estiver a carregar, mostra uma mensagem
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