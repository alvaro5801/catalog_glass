// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react"; 

export default function SignUpPage() {
  const router = useRouter(); 

  // Estados para todos os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados para feedback da UI
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação do frontend
    if (password !== confirmPassword) {
      setError("As senhas não correspondem. Por favor, tente novamente.");
      return;
    }

    setIsLoading(true); // Inicia o loading

    try {
      // Chamar a nossa nova API de backend
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a API retornar um erro (ex: 409 "E-mail já existe"), mostrá-lo
        throw new Error(data.error || 'Ocorreu um erro.');
      }

      // SUCESSO! Redirecionar para a página de verificação
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);

    } catch (error: unknown) { // ✅ Correção de Lint
      // Verificamos se 'error' é uma instância de 'Error'
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false); // Termina o loading
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
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                required 
                className="mt-1" 
                placeholder="Seu nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email-address">E-mail</Label>
              <Input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="mt-1" 
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

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "A criar conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}