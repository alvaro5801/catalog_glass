// src/app/(app)/layout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Header simplificado para a área logada
function DashboardHeader() {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Link>
          </Button>
          <h1 className="font-bold text-lg hidden sm:block">Meu Catálogo</h1>
        </div>
        
        {/* O botão "Sair" foi REMOVIDO daqui */}
        
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}