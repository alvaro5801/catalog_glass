// src/app/(app)/layout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // 1. Importar o ícone de seta

// Header para a área logada, agora com o botão de voltar
function DashboardHeader() {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 2. Adicionar o botão "Voltar" que leva para a página inicial */}
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Link>
          </Button>
          <h1 className="font-bold text-lg hidden sm:block">Meu Catálogo</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/saas">Sair</Link>
        </Button>
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