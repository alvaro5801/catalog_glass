// src/app/vitrine/page.tsx
import { HomeContent } from "@/app/home-content";
import PageLayout from "@/app/page-layout"; 
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';
import { prisma } from "@/lib/prisma"; // ✅ 1. Importar o Prisma

export const dynamic = 'force-dynamic';

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

export default async function VitrinePage() {
  const productRepo = new ProductRepository();
  const productService = new ProductService(productRepo);
  const categoryRepo = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepo);

  // ✅ 2. LÓGICA CORRIGIDA: Buscar o mesmo catálogo que a Home Page usa
  const catalog = await prisma.catalog.findFirst();
  const MAIN_CATALOG_ID = catalog?.id || "sem-catalogo";
  
  console.log(`🔍 [Vitrine] A usar Catálogo: ${catalog?.slug} (ID: ${MAIN_CATALOG_ID})`);

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