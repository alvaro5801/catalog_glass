// src/app/catalogo/catalog-content.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import type {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Specification,
  PriceTier,
} from "@prisma/client";

type ProductFromApi = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

export function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<PrismaCategory[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(["Todos"]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  // 🟢 Carrega dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Falha ao carregar os dados do catálogo.");
        }

        const productsData: ProductFromApi[] = await productsRes.json();
        const categoriesData: PrismaCategory[] = await categoriesRes.json();

        // 🔧 Mapeia produtos com nome da categoria (não ID)
        const formattedProducts = productsData.map((p) => {
          const categoryName =
            categoriesData.find((c) => c.id === p.categoryId)?.name || "N/A";

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            images: p.images,
            shortDescription: p.shortDescription || "",
            description: p.description || "",
            category: categoryName,
            specifications:
              p.specifications ?? { material: "", capacidade: "", dimensoes: "" },
            priceTable: p.priceTable,
            priceInfo: p.priceInfo || "",
            isFeatured: p.isFeatured,
          };
        });

        const categoryNames = categoriesData.map((c) => c.name);

        setProducts(formattedProducts);
        setCategoriesData(categoriesData);
        setAllCategories(["Todos", ...categoryNames]);
      } catch (error) {
        console.error("Falha ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟢 Sincroniza categoria ativa com o parâmetro da URL (?categoria=)
  useEffect(() => {
    const categoryIdFromURL = searchParams.get("categoria");
    if (categoryIdFromURL && categoriesData.length > 0) {
      const categoryName = categoriesData.find(
        (c) => c.id === categoryIdFromURL
      )?.name;
      if (categoryName && allCategories.includes(categoryName)) {
        setActiveCategory(categoryName);
      }
    }
  }, [searchParams, categoriesData, allCategories]);

  // 🟢 Filtragem reativa por categoria
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  // 🔁 Reforça atualização da lista após mudar categoria (útil em testes e SSR)
  useEffect(() => {
    // Apenas força re-render visual
  }, [activeCategory]);

  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground animate-pulse">
        A carregar catálogo...
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            data-testid={`category-btn-${category}`}
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
