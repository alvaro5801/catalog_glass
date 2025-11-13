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

// Tipo auxiliar para a resposta da API e para as props
type ProductFromApi = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

// ✅ NOVA INTERFACE DE PROPS
interface CatalogContentProps {
  products?: ProductFromApi[];      // Dados opcionais vindos do Server Component
  categories?: PrismaCategory[];    // Dados opcionais vindos do Server Component
}

export function CatalogContent({ products: initialProducts, categories: initialCategories }: CatalogContentProps) {
  
  // Função auxiliar para formatar produtos (reutilizada tanto para props quanto para fetch)
  const formatProducts = (rawProducts: ProductFromApi[], rawCategories: PrismaCategory[]): Product[] => {
    return rawProducts.map((p) => {
      const categoryName =
        rawCategories.find((c) => c.id === p.categoryId)?.name || "N/A";

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
  };

  // --- ESTADOS ---
  
  // Se recebermos dados via props (initialProducts), formatamos logo. Senão, iniciamos vazio.
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialCategories 
      ? formatProducts(initialProducts, initialCategories) 
      : []
  );

  const [categoriesData, setCategoriesData] = useState<PrismaCategory[]>(initialCategories || []);
  
  // Se recebermos categorias, extraímos os nomes. Senão, iniciamos com "Todos".
  const [allCategories, setAllCategories] = useState<string[]>(
    initialCategories 
      ? ["Todos", ...initialCategories.map((c) => c.name)] 
      : ["Todos"]
  );

  const [activeCategory, setActiveCategory] = useState("Todos");
  
  // Se já tivermos dados iniciais, não estamos a carregar
  const [isLoading, setIsLoading] = useState(!initialProducts);
  
  const searchParams = useSearchParams();

  // 🟢 1. EFEITO: Carregar dados APENAS se não vieram via props
  useEffect(() => {
    // Se já temos dados iniciais (props), não fazemos fetch
    if (initialProducts && initialCategories) {
        setIsLoading(false);
        return;
    }

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

        const formattedProducts = formatProducts(productsData, categoriesData);
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
  }, [initialProducts, initialCategories]);

  // 🟢 2. EFEITO: Sincronizar categoria ativa com o parâmetro da URL (?categoria=)
  useEffect(() => {
    const categoryParam = searchParams.get("categoria");
    if (categoryParam && categoriesData.length > 0) {
      // Tenta encontrar por ID ou por Nome (case insensitive para URLs mais amigáveis)
      const categoryObj = categoriesData.find(
        (c) => c.id === categoryParam || c.name.toLowerCase() === categoryParam.toLowerCase()
      );
      
      if (categoryObj && allCategories.includes(categoryObj.name)) {
        setActiveCategory(categoryObj.name);
      }
    }
  }, [searchParams, categoriesData, allCategories]);

  // 🟢 3. MEMO: Filtragem reativa por categoria
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  // 🔁 Reforça atualização da lista após mudar categoria
  useEffect(() => {
    // Apenas força re-render visual
  }, [activeCategory]);

  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground animate-pulse mt-10">
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
          <p className="col-span-3 text-center text-muted-foreground py-10">
            Nenhum produto encontrado nesta categoria.
          </p>
        )}
      </div>
    </>
  );
}