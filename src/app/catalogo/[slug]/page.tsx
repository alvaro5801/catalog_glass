// src/app/catalogo/[slug]/page.tsx

import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail"; // Importe o novo componente

// Interface para definir as props
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// A função de servidor para gerar as páginas estáticas
export function generateStaticParams() {
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