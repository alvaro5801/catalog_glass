// src/app/page.tsx
import { HomeContent } from "@/app/home-content";
import PageLayout from "@/app/page-layout";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';
import { prisma } from "@/lib/prisma"; // ✅ Adicionado para buscar o ID correto

export const dynamic = 'force-dynamic';

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

export default async function Home() {
  const productRepo = new ProductRepository();
  const productService = new ProductService(productRepo);
  const categoryRepo = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepo);

  // 1. BUSCA AUTOMÁTICA DO CATÁLOGO
  // Isto garante que usamos o catálogo que realmente existe na tua base de dados
  const catalog = await prisma.catalog.findFirst();
  
  // Se não houver catálogo, usamos um fallback para evitar erros, mas o ideal é criar um catálogo
  const MAIN_CATALOG_ID = catalog?.id || "sem-catalogo";

  console.log(`🔍 [Home] A usar Catálogo: ${catalog?.slug || 'Nenhum'} (ID: ${MAIN_CATALOG_ID})`);

  // 2. Buscar dados usando o ID dinâmico
  const [products, categories] = await Promise.all([
    productService.getProducts(MAIN_CATALOG_ID),
    categoryService.getAllCategories(MAIN_CATALOG_ID)
  ]);

  // 3. Formatar produtos
  const allFormattedProducts = products.map((p: ProductWithRelations) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      images: p.images,
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      category: categories.find(c => c.id === p.categoryId)?.name || "N/A",
      specifications: {
          material: p.specifications?.material || "",
          capacidade: p.specifications?.capacidade || "",
          dimensoes: p.specifications?.dimensoes || "",
      },
      priceTable: p.priceTable.map(pt => ({ quantity: pt.quantity, price: pt.price })),
      priceInfo: p.priceInfo || "",
      isFeatured: p.isFeatured
  }));

  const featuredProducts = allFormattedProducts.filter(p => p.isFeatured);

  return (
    <PageLayout>
      <HomeContent 
        featuredProducts={featuredProducts} 
        allProducts={allFormattedProducts} 
        allCategories={categories} 
      />
    </PageLayout>
  );
}