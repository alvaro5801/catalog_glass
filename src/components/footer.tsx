// src/components/footer.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { Facebook, Instagram } from "lucide-react";

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
            <Button asChild variant="ghost" size="icon">
              <Link href="https://facebook.com" target="_blank">
                <Facebook 
                  className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" 
                  strokeWidth={2.25} // Deixa o traço mais grosso
                />
                <span className="sr-only">Facebook</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="https://instagram.com" target="_blank">
                <Instagram 
                  className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
                  strokeWidth={2.25} // Deixa o traço mais grosso
                />
                <span className="sr-only">Instagram</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}