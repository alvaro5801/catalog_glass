// src/app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { CatalogContent } from "../catalogo/catalog-content"; // Reutilizamos o seu componente existente!
import { CatalogRepository } from "@/domain/repositories/CatalogRepository";
import { CatalogService } from "@/domain/services/CatalogService";

// Forçar renderização dinâmica para garantir dados frescos
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicStorePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Instanciar Serviços
  const catalogRepository = new CatalogRepository();
  const catalogService = new CatalogService(catalogRepository);

  // 2. Buscar dados do Catálogo pelo Slug da URL
  const catalog = await catalogService.getCatalogBySlug(slug);

  // 3. Se não existir, página 404
  if (!catalog) {
    notFound();
  }

  // 4. Preparar dados para o componente visual
  // O CatalogContent espera 'products' e 'categories'.
  // O nosso service já traz tudo isso via 'include' no Prisma.
  
  return (
    <div className="min-h-screen bg-background">
      {/* Aqui podemos passar o nome da loja também se o componente aceitar */}
      <header className="bg-primary text-primary-foreground p-4 text-center">
         <h1 className="text-xl font-bold">Loja: {slug}</h1>
      </header>
      
      <CatalogContent 
        products={catalog.products} 
        categories={catalog.categories} 
      />
    </div>
  );
}