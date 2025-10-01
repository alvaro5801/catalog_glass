// src/components/header.tsx
import Link from "next/link";
// import { ShoppingBag } from "lucide-react"; // Exemplo de ícone que podemos usar no futuro

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Lado Esquerdo: Logótipo */}
        <div className="flex items-center gap-2">
          {/* <ShoppingBag className="h-6 w-6" /> */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            Copos&Cia
          </Link>
        </div>

        {/* Lado Direito: Navegação */}
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/catalogo" className="hover:text-primary transition-colors">
            Catálogo
          </Link>
          {/* <Link href="/sobre" className="hover:text-primary transition-colors">
            Sobre Nós
          </Link>
          <Link href="/contato" className="hover:text-primary transition-colors">
            Contato
          </Link> */}
        </nav>
      </div>
    </header>
  );
}