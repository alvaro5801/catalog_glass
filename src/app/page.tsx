// src/app/page.tsx
import { ProductCard } from "../components/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import PageLayout from "./page-layout";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Search, PenSquare, MessageCircle, GlassWater, Wine, Coffee } from "lucide-react";
// import { motion } from "framer-motion"; // <-- 1. REMOVIDO DAQUI

// ✅ 2. IMPORTADO O NOVO COMPONENTE "CLIENT"
import { HeroBanner } from "@/components/hero-banner";

// Importar os nossos serviços e tipos do Prisma
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct } from '@prisma/client';

// A página continua a ser um Server Component (async)
export default async function Home() {
  // Instanciar serviços para buscar dados
  const productRepository = new ProductRepository();
  const productService = new ProductService(productRepository);
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  // TODO: Obter o ID do catálogo do utilizador correto
  const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

  // Buscar todos os produtos e categorias
  const allProducts = await productService.getProducts(MOCK_CATALOG_ID);
  const allCategories = await categoryService.getAllCategories(MOCK_CATALOG_ID);

  // Filtrar produtos em destaque no servidor
  const featuredProducts = allProducts.filter(product => product.isFeatured);

  // O resto da sua lógica de ícones e cores permanece
  const categoryIcons: { [key: string]: React.ElementType } = {
    Copos: GlassWater,
    Taças: Wine,
    Canecas: Coffee,
    Squeezes: GlassWater,
  };
  const categoryHoverColors: { [key: string]: string } = {
    Copos: 'group-hover:text-sky-500',
    Taças: 'group-hover:text-red-500',
    Canecas: 'group-hover:text-amber-600',
    Squeezes: 'group-hover:text-lime-500',
  };

  // Mapear os produtos para o formato que o ProductCard espera
  const formatProductForCard = (product: PrismaProduct) => ({
    ...product,
    id: product.id,
    category: product.categoryId,
    // O Prisma já retorna priceTable e specifications, que não são usados diretamente no Card, mas mantemos para consistência
    priceTable: [],
    specifications: { material: '', capacidade: '', dimensoes: '' }
  });

  return (
    <PageLayout>
      {/* Secção 1: Banner Principal */}

      {/* ✅ 3. O CONTEÚDO DA SECÇÃO FOI SUBSTITUÍDO PELO NOVO COMPONENTE */}
      <HeroBanner />

      {/* Secção 2: Como Funciona */}
      <section id="como-funciona" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto"><h2 className="text-3xl md:text-4xl font-bold">Personalize em Apenas 3 Passos</h2><p className="mt-4 text-muted-foreground">O nosso processo é simples e rápido, pensado para si.</p></div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center"><div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><Search className="h-8 w-8" /></div><h3 className="text-xl font-semibold">1. Explore os Modelos</h3><p className="mt-2 text-muted-foreground">Navegue pelo nosso catálogo e descubra a variedade de copos e taças disponíveis.</p></div>
            <div className="flex flex-col items-center"><div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><PenSquare className="h-8 w-8" /></div><h3 className="text-xl font-semibold">2. Escolha o seu Favorito</h3><p className="mt-2 text-muted-foreground">Veja os detalhes, a tabela de preços e imagine a sua marca no produto.</p></div>
            <div className="flex flex-col items-center"><div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4"><MessageCircle className="h-8 w-8" /></div><h3 className="text-xl font-semibold">3. Chame no WhatsApp</h3><p className="mt-2 text-muted-foreground">Clique no botão de contacto para falar com a nossa equipa e finalizar o seu pedido.</p></div>
          </div>
        </div>
      </section>

      {/* 3. A seção de destaques agora usa os dados da base de dados. */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Produtos em Destaque</h2>
              <p className="mt-4 text-muted-foreground">Os nossos produtos mais populares, selecionados para si.</p>
            </div>
            <div className="mt-12">
              <Carousel opts={{ align: "start", loop: featuredProducts.length > 3 }} className="w-full max-w-sm md:max-w-2xl lg:max-w-5xl mx-auto">
                <CarouselContent>
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="sm:basis-1/2 lg:basis-1/4">
                      <div className="p-1"><ProductCard product={formatProductForCard(product)} /></div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:inline-flex" />
                <CarouselNext className="hidden sm:inline-flex" />
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* 4. A seção de categorias agora usa os dados da base de dados. */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto"><h2 className="text-3xl md:text-4xl font-bold">Navegue por Categoria</h2><p className="mt-4 text-muted-foreground">Encontre exatamente o que precisa de forma rápida e fácil.</p></div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {allCategories.map((category) => {
              const Icon = categoryIcons[category.name] || GlassWater;
              const hoverColorClass = categoryHoverColors[category.name] || 'group-hover:text-primary';
              return (
                <Link href={`/catalogo?categoria=${category.name.toLowerCase()}`} key={category.id} className="group flex flex-col items-center justify-center p-6 bg-background rounded-lg border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <Icon className={`h-10 w-10 text-muted-foreground transition-colors ${hoverColorClass}`} />
                  <h3 className="mt-4 text-lg font-semibold">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}