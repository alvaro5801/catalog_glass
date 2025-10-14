// src/app/saas/page.tsx
"use client";

import PageLayout from "../page-layout"; // 1. Importar o PageLayout
import { Button } from "../../components/ui/button";
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

// Componente para os logótipos da prova social (pode mover para outro ficheiro mais tarde)
function FakeLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center text-center text-gray-500 font-semibold p-4 h-20 w-48 border-2 border-gray-200 rounded-lg bg-gray-50">
      {name}
    </div>
  );
}

export default function SaasLandingPage() {
  return (
    // 2. Envolver todo o conteúdo com o PageLayout
    <PageLayout>
      {/* 3. A tag <main> foi removida daqui, pois já existe no PageLayout */}
      
      {/* Secção 1: Herói (Abertura Impactante) */}
      <section className="text-center py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-800">
            Crie um catálogo online profissional em menos de 5 minutos.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Diga adeus aos PDFs desatualizados. Ofereça aos seus clientes uma
            experiência de compra moderna e interativa que funciona em qualquer
            dispositivo.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              {/* O link de cadastro aponta para a rota dentro de (auth) */}
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

      {/* Secção 2: Prova Social (Confiança Imediata) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-lg font-semibold text-gray-600">
            Junte-se a centenas de empreendedores que já simplificaram as suas
            vendas.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 md:gap-8">
            <FakeLogo name="Doce Sabor Confeitaria" />
            <FakeLogo name="Ateliê Criativo" />
            <FakeLogo name="Moda & Estilo Boutique" />
            <FakeLogo name="Rústico & Moderno" />
          </div>
        </div>
      </section>

      {/* Secção 3: O Problema e a Solução (Conexão e Alívio) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* O "Antes" (O Problema) */}
          <div className="bg-white p-8 rounded-lg border shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800">
              Ainda preso aos catálogos do passado?
            </h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">PDFs desatualizados</h4>
                  <p className="text-gray-600">
                    Risco de enviar a versão errada do catálogo para os clientes.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Processo Lento</h4>
                  <p className="text-gray-600">
                    Horas a refazer o design por pequenos ajustes de preço ou
                    produto.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Experiência Frustrante</h4>
                  <p className="text-gray-600">
                    Clientes perdidos em listas não interativas e difíceis de
                    navegar no telemóvel.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* O "Depois" (A Solução) */}
          <div className="bg-white p-8 rounded-lg border shadow-sm border-blue-500">
            <h3 className="text-2xl font-bold text-gray-800">
              Dê as boas-vindas ao seu novo assistente de vendas!
            </h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Atualizações Instantâneas</h4>
                  <p className="text-gray-600">
                    Altere uma vez, e o seu catálogo atualiza-se em todo o lado.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Design Profissional, Zero Esforço</h4>
                  <p className="text-gray-600">
                    Templates elegantes que valorizam a sua marca e os seus produtos.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Vendas Simplificadas</h4>
                  <p className="text-gray-600">
                    Link direto para o WhatsApp em cada produto para facilitar o contacto.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Secção 4: Funcionalidades em Destaque */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Tudo o que precisa para um catálogo que vende por si</h2>
            <p className="mt-4 text-gray-600">Funcionalidades pensadas para simplificar o seu dia-a-dia e impulsionar as suas vendas.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Edit className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Editor Super Simples</h3>
              <p className="mt-2 text-gray-600">Adicione produtos com a facilidade de quem escreve um e-mail.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Smartphone className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Design Profissional e Responsivo</h3>
              <p className="mt-2 text-gray-600">Aparência incrível em qualquer dispositivo, do telemóvel ao computador.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <MessageCircle className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Botão de WhatsApp Integrado</h3>
              <p className="mt-2 text-gray-600">Converta interesse em conversas de negócio com um clique.</p>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <Share2 className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Partilha com um Único Link</h3>
              <p className="mt-2 text-gray-600">Partilhe o seu catálogo com um link elegante em qualquer lugar.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Secção 5: Como Funciona? */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Pronto para ter o seu catálogo em 3 simples passos?</h2>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-center items-start text-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-2xl mb-4">1</div>
              <h3 className="text-xl font-semibold">Crie a sua Conta</h3>
              <p className="mt-2 text-muted-foreground max-w-xs">Registo rápido e gratuito, sem complicações.</p>
            </div>
            <div className="flex-shrink-0 text-gray-300 hidden md:block mt-8">
                <ChevronRight size={32} />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-2xl mb-4">2</div>
              <h3 className="text-xl font-semibold">Adicione os Seus Produtos</h3>
              <p className="mt-2 text-muted-foreground max-w-xs">Dê vida ao seu catálogo no nosso editor intuitivo.</p>
            </div>
            <div className="flex-shrink-0 text-gray-300 hidden md:block mt-8">
                <ChevronRight size={32} />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-2xl mb-4">3</div>
              <h3 className="text-xl font-semibold">Partilhe e Comece a Vender!</h3>
              <p className="mt-2 text-muted-foreground max-w-xs">Use o seu link exclusivo para alcançar os seus clientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secção 6: Preços */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Escolha o plano que cresce consigo</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Gratuito */}
            <div className="border rounded-lg p-8 flex flex-col">
              <h3 className="text-2xl font-semibold">Gratuito</h3>
              <p className="text-gray-600 mt-2">Ideal para começar.</p>
              <p className="mt-6 text-4xl font-bold">€0<span className="text-lg font-medium text-gray-500">/mês</span></p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Até 10 produtos</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Funcionalidades essenciais</li>
              </ul>
              <Button asChild variant="outline" className="mt-auto w-full">
                <Link href="/signup">Começar Gratuitamente</Link>
              </Button>
            </div>
            {/* Plano Pro */}
            <div className="border-2 border-blue-600 rounded-lg p-8 flex flex-col relative">
              <div className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded-full">MAIS POPULAR</div>
              <h3 className="text-2xl font-semibold">Pro</h3>
              <p className="text-gray-600 mt-2">Ideal para profissionalizar.</p>
              <p className="mt-6 text-4xl font-bold">€9.90<span className="text-lg font-medium text-gray-500">/mês</span></p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Produtos ilimitados</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Mais designs e personalização</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Suporte prioritário</li>
              </ul>
              <Button asChild className="mt-auto w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/signup-pro">Escolher Plano Pro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Secção 7: Chamada Final para Ação */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
            <Rocket className="h-12 w-12 text-blue-400 mx-auto" />
            <h2 className="mt-6 text-3xl md:text-4xl font-bold">Pronto para ter uma vitrine digital que trabalha por si?</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Junte-se a outros empreendedores e comece a criar o seu catálogo profissional hoje mesmo. É grátis para começar!</p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/signup">
                  Criar o Meu Catálogo Grátis Agora
                </Link>
              </Button>
            </div>
        </div>
      </section>
    </PageLayout>
  );
}