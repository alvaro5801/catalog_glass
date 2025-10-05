// src/components/header.tsx
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      {/* Adicionei 'overflow-hidden' ao div que tem h-24 */}
      <div className="container mx-auto px-4 h-24 flex items-center justify-between overflow-hidden"> {/* <-- MUDANÇA AQUI */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Logótipo Printa Copos"
            width={234}
            height={98}
            className="h-32 w-auto" // Aumentei o logo para h-32 (128px) como exemplo
          />
        </Link>

        <nav className="flex items-center gap-6 text-base font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/catalogo" className="hover:text-primary transition-colors">
            Catálogo
          </Link>
        </nav>
      </div>
    </header>
  );
}