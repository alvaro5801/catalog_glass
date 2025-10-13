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

// Define a tipagem de props de página conforme o padrão do Next 15
interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Página do produto
export default async function ProductPage({ params }: ProductPageProps) {
  // ✅ Corrige a diferença entre Promise e objeto
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
