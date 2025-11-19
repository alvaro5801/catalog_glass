// src/components/footer.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Catalogg. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button asChild variant="ghost">
              <Link href="https://facebook.com" target="_blank">
                <FaFacebook
                  className="text-muted-foreground hover:text-primary transition-colors"
                  style={{ height: '32px', width: '32px' }}
                />
                <span className="sr-only">Facebook</span>
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="https://instagram.com" target="_blank">
                <FaInstagram
                  className="text-muted-foreground hover:text-primary transition-colors"
                  style={{ height: '32px', width: '32px' }}
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