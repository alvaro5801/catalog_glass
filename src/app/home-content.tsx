// src/app/home-content.tsx
"use client";

import Link from "next/link";
import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { ProductCard } from "../components/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Button } from "../components/ui/button";
import { Search, PenSquare, MessageCircle, GlassWater, Wine, Coffee, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

import type { Category } from '@prisma/client';
import type { Product as CardProductType } from "@/lib/types";

interface HomeContentProps {
  featuredProducts: CardProductType[];
  allProducts: CardProductType[];
  allCategories: Category[];
}

export function HomeContent({ featuredProducts, allProducts = [], allCategories }: HomeContentProps) {
  const { favorites } = useFavorites();
  
  const favoriteProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return allProducts.filter(p => favorites.includes(p.id));
  }, [favorites, allProducts]);

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

  return (
    <>
      {/* Secção 1: Banner Principal */}
      <section className="relative h-screen w-full overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Transforme Momentos em Memórias com Copos Personalizados
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90">
              Desde festas vibrantes a brindes corporativos elegantes, encontre o copo
              perfeito para cada ocasião.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg"><Link href="/catalogo">Explorar Catálogo</Link></Button>
              <Button asChild size="lg" variant="secondary"><Link href="#como-funciona">Ver Como Funciona</Link></Button>
            </div>
          </div>
        </motion.div>
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(/images/hero-background.jpg)` }} />
        <div className="absolute inset-0 z-0 bg-black/40" />
      </section>

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

      {/* ✅ SECÇÃO: Os Seus Favoritos */}
      {favoriteProducts.length > 0 && (
        <section className="py-20 bg-red-50 border-y border-red-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-8 w-8 text-red-500 fill-red-500 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Os Seus Favoritos</h2>
              <p className="mt-2 text-gray-600">
                Não perca de vista os produtos que amou. Peça um orçamento agora!
              </p>
            </div>

            <Carousel opts={{ align: "start", loop: favoriteProducts.length > 3 }} className="w-full max-w-sm md:max-w-2xl lg:max-w-5xl mx-auto">
              <CarouselContent>
                {favoriteProducts.map((product) => (
                  <CarouselItem key={product.id} className="sm:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:inline-flex" />
              <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
            
            {/* ❌ BOTÃO REMOVIDO DAQUI 
               O bloco <div className="mt-10 text-center">...</div> foi apagado.
            */}
            
          </div>
        </section>
      )}

      {/* Secção 3: Produtos em Destaque */}
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
                      <div className="p-1"><ProductCard product={product} /></div>
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

      {/* Secção 4: Navegue por Categoria */}
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
    </>
  );
}