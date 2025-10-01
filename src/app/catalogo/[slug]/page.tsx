// src/app/catalogo/[slug]/page.tsx

import { products } from "../../../data/products";
import Link from "next/link";
import { notFound } from "next/navigation";

// Interface para definir as props que a nossa página irá receber
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// 1. Dizer ao Next.js QUAIS páginas dinâmicas ele deve gerar no momento do build
export function generateStaticParams() {
  // Mapeamos a nossa lista de produtos para retornar um array de slugs
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// 2. O componente da página que irá renderizar os detalhes do produto
export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  // Encontrar o produto que corresponde ao slug da URL
  const product = products.find((p) => p.slug === slug);

  // Se o produto não for encontrado, mostramos a página 404
  if (!product) {
    notFound();
  }
  
  // Mensagem pré-formatada para o WhatsApp (lembre-se de trocar o número)
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o produto "${product.name}" no site e gostaria de mais informações.`
  );
  const whatsappLink = `https://wa.me/SEUNUMERODEWHATSAPP?text=${whatsappMessage}`;

  return (
    <main className="container mx-auto py-12 px-4">
      <Link href="/catalogo" className="text-primary hover:underline mb-8 block">
        &larr; Voltar para o Catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Lado Esquerdo: Galeria de Imagens (simplificada) */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          {/* Adicionaremos uma galeria real aqui mais tarde */}
          <span className="text-muted-foreground">Imagem Principal do Produto</span>
        </div>

        {/* Lado Direito: Detalhes do Produto */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-lg text-muted-foreground mt-4">{product.description}</p>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Tabela de Preços</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 font-medium">Quantidade</th>
                    <th className="p-3 font-medium text-right">Preço Unitário</th>
                  </tr>
                </thead>
                <tbody>
                  {product.priceTable.map((tier) => (
                    <tr key={tier.quantity} className="border-t">
                      <td className="p-3">{tier.quantity}</td>
                      <td className="p-3 text-right">
                        R$ {tier.price.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{product.priceInfo}</p>
          </div>
          
          <div className="mt-8">
             <h2 className="text-2xl font-semibold mb-3">Especificações</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Material:</strong> {product.specifications.material}</li>
                <li><strong>Capacidade:</strong> {product.specifications.capacidade}</li>
                <li><strong>Dimensões:</strong> {product.specifications.dimensoes}</li>
              </ul>
          </div>
          
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center w-full h-12 px-6 font-semibold text-lg text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}