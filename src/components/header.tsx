// src/components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation';
import { Input } from "./ui/input";

export function Header() {
  const pathname = usePathname();

  if (pathname === '/saas') {
    return (
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 h-24 flex items-center justify-end">
          <nav className="flex items-center gap-2 text-base font-medium">
            <Input type="email" placeholder="E-mail" className="hidden sm:flex" />
            <Input type="password" placeholder="Senha" className="hidden sm:flex" />
            
            {/* --- ALTERAÇÃO AQUI --- */}
            {/* O botão "Entrar" agora aponta para o nosso porteiro/redirecionador */}
            <Button asChild>
              <Link href="/login-redirect">Entrar</Link>
            </Button>

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