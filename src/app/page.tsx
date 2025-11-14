// src/app/page.tsx
"use client";

import PageLayout from "@/app/page-layout"; // ✅ Ajustado
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    CheckCircle, 
    XCircle, 
    ChevronRight,
    Edit,
    Smartphone,
    Share2,
    MessageCircle,
    Rocket
} from "lucide-react";

function FakeLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center text-center text-gray-500 font-semibold p-4 h-20 w-48 border-2 border-gray-200 rounded-lg bg-gray-50">
      {name}
    </div>
  );
}

export default function Home() {
  return (
    <PageLayout>
      
      {/* Secção 1: Herói */}
      <section className="text-center py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-800">
            Crie um catálogo online profissional em menos de 5 minutos.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Diga adeus aos PDFs desatualizados. Ofereça aos seus clientes uma
            experiência de compra moderna e interativa.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">
                Criar Meu Catálogo Grátis <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Grátis para sempre. Não é necessário cartão de crédito.
          </p>
        </div>
      </section>

      {/* Secção 2: Prova Social */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-lg font-semibold text-gray-600">
            Junte-se a centenas de empreendedores que já simplificaram as suas vendas.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 md:gap-8">
            <FakeLogo name="Doce Sabor Confeitaria" />
            <FakeLogo name="Ateliê Criativo" />
            <FakeLogo name="Moda & Estilo Boutique" />
            <FakeLogo name="Rústico & Moderno" />
          </div>
        </div>
      </section>

      {/* Secção 3: Funcionalidades */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Tudo o que precisa para vender mais</h2>
            <p className="mt-4 text-gray-600">Funcionalidades pensadas para o seu dia-a-dia.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Edit className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Editor Simples</h3>
              <p className="mt-2 text-gray-600">Adicione produtos facilmente.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Smartphone className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">100% Responsivo</h3>
              <p className="mt-2 text-gray-600">Funciona perfeitamente no telemóvel.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <MessageCircle className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">WhatsApp Integrado</h3>
              <p className="mt-2 text-gray-600">Pedidos chegam direto no seu WhatsApp.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Share2 className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Link Único</h3>
              <p className="mt-2 text-gray-600">Partilhe o seu catálogo onde quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secção 4: Chamada Final */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
            <Rocket className="h-12 w-12 text-blue-400 mx-auto" />
            <h2 className="mt-6 text-3xl md:text-4xl font-bold">Pronto para criar o seu catálogo?</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Comece hoje mesmo. É grátis!</p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/signup">
                  Começar Agora
                </Link>
              </Button>
            </div>
        </div>
      </section>
    </PageLayout>
  );
}