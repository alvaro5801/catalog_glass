// src/app/catalogo/[slug]/page.tsx
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import type { Product as PrismaProduct, Specification, PriceTier } from '@prisma/client';

// O Prisma retorna os produtos com as relações aninhadas.
// Vamos criar um tipo que reflete isso para usar no nosso componente.
type ProductWithRelations = PrismaProduct & {
  specifications: Specification | null;
  priceTable: PriceTier[];
};

// Instanciar o serviço
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

interface ProductPageProps {
  params: { slug: string; };
}

export async function generateStaticParams() {
  const products = await productService.getProducts("clxrz8hax00003b6khe69046c");
  return products.map((product: PrismaProduct) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const allProducts = await productService.getProducts("clxrz8hax00003b6khe69046c");
  const product = allProducts.find((p: PrismaProduct) => p.slug === slug) as ProductWithRelations | undefined;

  if (!product || !product.specifications) {
    notFound();
  }

  // ✅ CORREÇÃO: Mapeamos explicitamente as propriedades que o componente 'ProductDetail' espera.
  const formattedProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    images: product.images,
    priceInfo: product.priceInfo,
    isFeatured: product.isFeatured,
    category: product.categoryId, // Mapear de categoryId para category
    specifications: { // Incluir as especificações
      material: product.specifications.material,
      capacidade: product.specifications.capacidade,
      dimensoes: product.specifications.dimensoes,
    },
    priceTable: product.priceTable, // Incluir a tabela de preços
  };

  return <ProductDetail product={formattedProduct} />;
}