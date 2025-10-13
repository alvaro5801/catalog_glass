// src/app/catalogo/[slug]/page.tsx

import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";

// Não vamos usar mais a interface ProductPageProps

// A função de servidor para gerar as páginas estáticas
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// O componente de servidor que busca os dados
// A alteração foi feita aqui, na tipagem das props
export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // A página apenas retorna o componente de cliente, passando os dados do produto
  return <ProductDetail product={product} />;
}