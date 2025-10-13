// src/app/catalogo/[slug]/page.tsx
import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import type { Metadata } from "next/types"; // ✅ CORRIGIDO AQUI

type MetadataProps = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: MetadataProps
): Promise<Metadata> {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Produto Não Encontrado" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// ✅ Função da página
export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
