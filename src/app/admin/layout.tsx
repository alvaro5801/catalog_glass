// src/app/admin/layout.tsx
import { Sidebar, NavContent } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Store } from "lucide-react"; // ✅ Mudei o ícone para 'Store' (Loja)
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />

      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
          
          <div className="flex items-center gap-4">
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
          </div>

          {/* ✅ ALTERAÇÃO AQUI: O botão agora vai para /vitrine */}
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <Link href="/vitrine">
              <Store className="mr-2 h-4 w-4" />
              Ir para a Loja
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="icon" className="sm:hidden">
            <Link href="/vitrine">
              <Store className="h-5 w-5" />
            </Link>
          </Button>

        </header>

        <main className="flex-1 p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}