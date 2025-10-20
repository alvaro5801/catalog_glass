// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Importar o router
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react"; // 2. Importar o ícone de loading

export default function SignUpPage() {
  // 3. Estados para todos os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 4. Estado de carregamento
  const router = useRouter(); // 5. Instanciar o router

  // 6. Lógica de submissão (handleSubmit) atualizada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validação inicial no frontend
    if (password !== confirmPassword) {
      setError("As senhas não correspondem. Por favor, tente novamente.");
      setIsLoading(false);
      return;
    }

    try {
      // 7. Chamar a nossa API de registo
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // Se a API retornar um erro (ex: e-mail já existe)
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar a conta.');
      }

      // 8. Sucesso! Redirecionar o utilizador para a página de login
      // (Enviamos um parâmetro para mostrar uma mensagem de sucesso no futuro)
      router.push('/saas?status=signup-success');

    } catch (err: any) {
      // 9. Capturar e exibir erros (ex: "Este e-mail já está em uso.")
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-background p-8 md:p-10 border rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Crie a sua conta gratuita
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/saas" className="font-medium text-primary hover:underline">
              Faça login aqui
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 10. Ligar todos os inputs aos seus estados */}
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name" name="name" type="text" required className="mt-1"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email-address">E-mail</Label>
              <Input
                id="email-address" name="email" type="email" autoComplete="email" required className="mt-1"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1"
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="mt-1"
                placeholder="Confirme a sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 11. Exibir erros da API */}
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div>
            {/* 12. Botão com estado de carregamento */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}