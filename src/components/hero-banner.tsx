// src/components/hero-banner.tsx
"use client"; // 1. Esta é a diretiva mais importante!

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import Link from "next/link";

// 2. Criamos o componente que contém a lógica do "client"
export function HeroBanner() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 3. O motion.div agora está dentro de um "use client" component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white"
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Transforme Momentos em Memórias com Copos Personalizados
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90">
            Desde festas vibrantes a brindes corporativos elegantes, encontre o copo
            perfeito para cada ocasião.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/catalogo">Explorar Catálogo</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4. O resto da secção (elementos estáticos) também pode vir para aqui */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/images/hero-background.jpg)` }}
      />
      <div className="absolute inset-0 z-0 bg-black/40" />
    </section>
  );
}