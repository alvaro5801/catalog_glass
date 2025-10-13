// src/app/catalogo/[slug]/page.tsx

import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";

// Interface para definir as props
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// A função de servidor para gerar as páginas estáticas
// 1. Adicionado 'async' para corrigir o erro de tipo do Next.js
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// O componente de servidor que busca os dados
export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // A página apenas retorna o componente de cliente, passando os dados do produto
  return <ProductDetail product={product} />;
}