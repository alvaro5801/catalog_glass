// src/components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation';
import { useState } from "react"; 

// 1. Importar o painel lateral (Sheet)
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// 2. Importar AMBOS os formulários
import { SignInForm } from "./sign-in-form"; // Para o painel (vertical)
import { SignInFormHorizontal } from "./sign-in-form-horizontal"; // (NOVO) Para o desktop (horizontal)

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (pathname === '/saas') {
    return (
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          
          {/* Logótipo à Esquerda (para "empurrar" o formulário da direita) */}
          <Link href="/saas" className="text-2xl font-bold text-gray-800">
            SuaMarca
          </Link>

          {/* --- NAV PARA DESKTOP (Ecrãs 'md' ou maiores) --- */}
          {/* Mostra o novo formulário horizontal */}
          <nav className="hidden md:block">
            <SignInFormHorizontal />
          </nav>

          {/* --- NAV PARA MOBILE (Ecrãs 'md' ou menores) --- */}
          {/* Mostra os botões que abrem o painel lateral */}
          <nav className="flex md:hidden items-center gap-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">Entrar</Button>
              </SheetTrigger>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/signup">Cadastre-se</Link>
              </Button>

              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-2xl">Aceder à sua conta</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {/* Usa o formulário vertical original dentro do painel */}
                  <SignInForm />
                </div>
              </SheetContent>
            </Sheet>
          </nav>

        </div>
      </header>
    );
  }

  // (O resto do ficheiro - cabeçalho "logado" - continua igual)
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between overflow-hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logótipo Printa Copos" width={234} height={98} className="h-32 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 text-base font-medium">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Início</Link>
          <Link href="/catalogo" className="text-muted-foreground hover:text-primary transition-colors">Catálogo</Link>
          <Button asChild><Link href="/admin/dashboard">Aceder ao Painel</Link></Button>
          <Button variant="outline" asChild><Link href="/saas">Sair</Link></Button>
        </nav>
      </div>
    </header>
  );
}