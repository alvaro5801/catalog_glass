// src/app/page.tsx
import { Button } from "../components/ui/button";
import Link from "next/link";
import { Search, PenSquare, MessageCircle } from "lucide-react";
import { products } from "../data/products"; // 1. Importe os nossos dados de produtos
import { ProductCard } from "../components/product-card"; // 2. Importe o nosso Card de Produto

export default function Home() {
  // 3. Selecione alguns produtos para destacar (ex: os 2 primeiros)
  const featuredProducts = products.slice(0, 2);

  return (
    <main>
      {/* Secção 1: Banner Principal (Hero) */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Transforme Momentos em Memórias com Copos Personalizados
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground">
            Desde festas vibrantes a brindes corporativos elegantes, encontre o copo
            perfeito para cada ocasião. Qualidade e design que marcam.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/catalogo">Explorar Catálogo</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Secção 2: Como Funciona */}
      <section id="como-funciona" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Personalize em Apenas 3 Passos
            </h2>
            <p className="mt-4 text-muted-foreground">
              O nosso processo é simples e rápido, pensado para si.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><Search className="h-8 w-8" /></div>
              <h3 className="text-xl font-semibold">1. Explore os Modelos</h3>
              <p className="mt-2 text-muted-foreground">Navegue pelo nosso catálogo e descubra a variedade de copos e taças disponíveis.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><PenSquare className="h-8 w-8" /></div>
              <h3 className="text-xl font-semibold">2. Escolha o seu Favorito</h3>
              <p className="mt-2 text-muted-foreground">Veja os detalhes, a tabela de preços e imagine a sua marca no produto.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><MessageCircle className="h-8 w-8" /></div>
              <h3 className="text-xl font-semibold">3. Chame no WhatsApp</h3>
              <p className="mt-2 text-muted-foreground">Clique no botão de contacto para falar com a nossa equipa e finalizar o seu pedido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secção 3: Produtos em Destaque */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Os Mais Pedidos</h2>
            <p className="mt-4 text-muted-foreground">
              Conheça os produtos favoritos dos nossos clientes.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}