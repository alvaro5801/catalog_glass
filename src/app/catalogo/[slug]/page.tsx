// src/app/catalogo/[slug]/page.tsx
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';

// ✅ --- INSTRUÇÃO A (Correta) ---
// Esta linha força a página a ser dinâmica (SSR)
export const dynamic = 'force-dynamic';

type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

interface ProductPageProps {
  params: { slug: string; };
}

// ✅ --- INSTRUÇÃO B (Corrigida) ---
// O Next.js estava a tentar executar esta função durante o 'build'.
// Como a página é 'force-dynamic', não precisamos de gerar parâmetros estáticos.
// Vamos comentar esta função para resolver o erro de build.
/*
export async function generateStaticParams() {
  const products = await productService.getProducts("clxrz8hax00003b6khe69046c");
  return products.map((product: PrismaProduct) => ({
    slug: product.slug,
  }));
}
*/
// --- FIM DA CORREÇÃO ---

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const allProducts = await productService.getProducts("clxrz8hax00003b6khe69046c");
  const product = allProducts.find((p: PrismaProduct) => p.slug === slug) as ProductWithRelations | undefined;

  if (!product || !product.specifications) {
    notFound();
  }

  const formattedProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    images: product.images,
    priceInfo: product.priceInfo,
    isFeatured: product.isFeatured,
    category: product.categoryId, 
    specifications: { 
      material: product.specifications.material,
      capacidade: product.specifications.capacidade,
      dimensoes: product.specifications.dimensoes,
    },
    priceTable: product.priceTable.map(p => ({ quantity: p.quantity, price: p.price })),
  };

  return <ProductDetail product={formattedProduct} />;
}