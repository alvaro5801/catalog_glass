// src/app/catalogo/page.tsx
import { Suspense } from "react";
import { CatalogContent } from "./catalog-content";
import PageLayout from "../page-layout"; // Importar o PageLayout

export default function CatalogoPage() {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Nosso Catálogo</h1>
        <p className="text-muted-foreground text-center mb-10">
          Explore a nossa coleção completa ou filtre por categoria.
        </p>

        <Suspense fallback={<p className="text-center">A carregar filtros...</p>}>
          <CatalogContent />
        </Suspense>
      </div>
    </PageLayout>
  );
}