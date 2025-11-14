// src/app/[slug]/page.tsx
import { notFound } from "next/navigation";
// ✅ CORREÇÃO: Usar o caminho absoluto '@' resolve o erro de "Cannot find module"
import { CatalogContent } from "@/app/catalogo/catalog-content"; 
import { CatalogRepository } from "@/domain/repositories/CatalogRepository";
import { CatalogService } from "@/domain/services/CatalogService";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

// Params como Promise para compatibilidade com Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicStorePage({ params }: PageProps) {
  // 1. Await params
  const { slug } = await params;

  // 2. Instanciar Serviços
  const catalogRepository = new CatalogRepository();
  const catalogService = new CatalogService(catalogRepository);

  // 3. Buscar dados do Catálogo
  const catalog = await catalogService.getCatalogBySlug(slug);

  if (!catalog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground capitalize">
              {slug.replace(/-/g, ' ')}
            </h1>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Catálogo Digital
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <CatalogContent 
          products={catalog.products} 
          categories={catalog.categories} 
        />
      </main>

      <footer className="border-t bg-muted/50 py-6 mt-auto">
        <div className="container mx-auto text-center px-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {slug.replace(/-/g, ' ')}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by <Link href="/" className="hover:underline text-primary">Printa Copos</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}