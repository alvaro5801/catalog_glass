// src/app/catalogo/[slug]/page.tsx
import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";

// Gera as rotas estáticas
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// ✅ Página do produto (tipagem compatível com Next 15)
export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await Promise.resolve(params); // garante compatibilidade

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
