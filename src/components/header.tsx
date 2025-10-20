// src/components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { usePathname, useRouter } from 'next/navigation'; // 1. Importar useRouter
import { Input } from "./ui/input";
import { signIn } from "next-auth/react"; // 2. Importar o signIn
import React, { useState } from "react"; // 3. Importar useState
import { AlertCircle, Loader2 } from "lucide-react"; // 4. Para feedback

export function Header() {
  const pathname = usePathname();
  const router = useRouter(); // 5. Instanciar o router

  // 6. Estados para o formulário de login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 7. Função para gerir o login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 8. Chamar o signIn do NextAuth
      const result = await signIn("credentials", {
        // Usamos 'redirect: false' para que a página não seja
        // recarregada automaticamente. Isto permite-nos gerir
        // o resultado e os erros aqui mesmo.
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Se o NextAuth retornar um erro (ex: "Senha inválida." da nossa API)
        setError("E-mail ou senha inválidos. Tente novamente.");
      } else if (result?.ok) {
        // 9. Sucesso!
        // Redirecionamos para o nosso 'porteiro' (login-redirect),
        // que já sabe o que fazer (verificar onboarding).
        router.push('/login-redirect');
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica do Header para /saas ---
  if (pathname === '/saas') {
    return (
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 h-24 flex items-center justify-end">

          {/* 10. Transformar a 'nav' num formulário */}
          <form onSubmit={handleLogin} className="flex items-center gap-2 text-base font-medium">

            {/* 11. Exibir erros de login */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Input
              type="email"
              placeholder="E-mail"
              className="hidden sm:flex"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Senha"
              className="hidden sm:flex"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            {/* 12. O botão "Entrar" agora submete o formulário */}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>

            <Button variant="outline" asChild>
              <Link href="/signup">Cadastre-se</Link>
            </Button>
          </form>

        </div>
      </header>
    );
  }

  // --- Lógica do Header para o site público ---
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