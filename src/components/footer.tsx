// src/components/footer.tsx
export function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="border-t bg-muted">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Copos&Cia. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* Adicionaremos os links das redes sociais aqui */}
              <p className="text-sm text-muted-foreground">
                Siga-nos nas redes sociais!
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }