// src/components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation';
// import { Input } from "./ui/input"; // REMOVIDO: Já não é necessário
// 1. IMPORTAR O NOVO FORMULÁRIO DE LOGIN
import { SignInForm } from "./sign-in-form"; 

export function Header() {
  const pathname = usePathname();

  if (pathname === '/saas') {
    return (
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 h-24 flex items-center justify-end">
          {/* 2. SUBSTITUIR A NAVEGAÇÃO ESTÁTICA PELO FORMULÁRIO DE LOGIN */}
          <nav className="flex items-center gap-2 text-base font-medium">
            
            {/* O formulário de login (Inputs + Botão Entrar) */}
            <div className="hidden sm:block w-72">
              <SignInForm />
            </div>
          
            {/* O botão "Cadastre-se" permanece */}
            <Button variant="outline" asChild>
              <Link href="/signup">Cadastre-se</Link>
            </Button>
            
          </nav>
        </div>
      </header>
    );
  }

  // Cabeçalho para o site de produtos ("logado")
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