// src/components/footer.tsx
import Link from "next/link";
import { Button } from "./ui/button";
// 1. Importe os nossos novos ícones personalizados
import { FacebookIcon } from "./icons/facebook-icon";
import { InstagramIcon } from "./icons/instagram-icon";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Copos&Cia. Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            {/* 2. Use os novos componentes de ícone */}
            <Button asChild variant="ghost" size="icon">
              <Link href="https://facebook.com" target="_blank">
                <FacebookIcon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                <span className="sr-only">Facebook</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="https://instagram.com" target="_blank">
                <InstagramIcon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                <span className="sr-only">Instagram</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}