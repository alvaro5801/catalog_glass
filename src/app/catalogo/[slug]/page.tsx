// src/app/catalogo/[slug]/page.tsx

import { products } from "../../../data/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import type { Metadata, ResolvingMetadata } from 'next';

/**
 * Documentação do Tipo de Props
 * Este tipo define a estrutura das propriedades que o Next.js passa
 * tanto para a página (`ProductPage`) quanto para a função de metadados (`generateMetadata`).
 * - params: Contém os segmentos dinâmicos da URL. Neste caso, o `slug` do produto.
 */
type Props = {
  params: { slug: string };
};

/**
 * Documentação da Função `generateMetadata`
 * Esta função gera metadados dinâmicos para a página do produto.
 * É executada no servidor antes de a página ser renderizada.
 * @param params - Os parâmetros da rota, contendo o slug do produto.
 * @returns Um objeto de Metadados com o título e a descrição da página.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const product = products.find((p) => p.slug === slug);

  // Se o produto não for encontrado, retorna metadados genéricos.
  if (!product) {
    return {
      title: "Produto Não Encontrado",
    };
  }

  // Retorna o nome do produto como título e sua descrição.
  return {
    title: product.name,
    description: product.description,
  };
}

/**
 * Documentação da Função `generateStaticParams`
 * Esta função informa ao Next.js quais rotas dinâmicas devem ser geradas
 * estaticamente durante o processo de build.
 * @returns Um array de objetos, onde cada objeto representa os `params` de uma página de produto.
 */
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Documentação do Componente `ProductPage`
 * Este é o componente de servidor que renderiza a página de detalhes de um produto.
 * @param params - Os parâmetros da rota, contendo o slug do produto.
 * @returns O JSX da página de detalhes do produto ou uma página 404 se não for encontrado.
 */
export default function ProductPage({ params }: Props) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  // Se o slug na URL não corresponder a nenhum produto, exibe a página de erro 404.
  if (!product) {
    notFound();
  }

  // Renderiza o componente de cliente `ProductDetail`, passando os dados do produto encontrado.
  return <ProductDetail product={product} />;
}