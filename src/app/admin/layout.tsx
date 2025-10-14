// src/app/admin/layout.tsx
// Esta versão não tem mais a lógica de redirecionamento. É apenas um layout visual.

import { Sidebar, NavContent } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Barra Lateral para ecrãs grandes */}
      <Sidebar />

      <div className="flex flex-col w-full">
        {/* Cabeçalho da área de conteúdo, com o menu hambúrguer */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          {/* Botão de Menu para ecrãs pequenos */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
          <h1 className="text-xl font-semibold">Painel de Controlo</h1>
        </header>

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}