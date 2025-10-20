// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não correspondem. Por favor, tente novamente.");
      return;
    }

    console.log("Formulário válido!");
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
              <Input id="name" name="name" type="text" required className="mt-1" placeholder="Seu nome completo" />
            </div>
            <div>
              <Label htmlFor="email-address">E-mail</Label>
              <Input id="email-address" name="email" type="email" autoComplete="email" required className="mt-1" placeholder="seu@email.com" />
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
              />
            </div>
          </div>

          {/* ✅ CORREÇÃO AQUI: Adicionar o role="alert" */}
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full">
              Criar Conta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}