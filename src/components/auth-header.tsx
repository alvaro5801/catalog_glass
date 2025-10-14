// src/components/auth-header.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      {/* 1. Alinhamento alterado para 'justify-end' */}
      <div className="container mx-auto px-4 h-24 flex items-center justify-end">
        
        {/* 2. Logótipo removido desta secção */}
        
        {/* Botão para voltar à landing page */}
        <Button asChild variant="outline">
          <Link href="/saas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
    </header>
  );
}