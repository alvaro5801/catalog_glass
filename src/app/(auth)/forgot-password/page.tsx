// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Erro ao tentar enviar e-mail.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Verifique o seu e-mail</h1>
        <p className="text-muted-foreground">
          Se existir uma conta com o e-mail <strong>{email}</strong>, receberá um link para redefinir a sua senha em breve.
        </p>
        <Button asChild className="w-full" variant="outline">
          <Link href="/saas">Voltar ao Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar Senha</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Insira o seu e-mail e enviaremos um link para criar uma nova senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            placeholder="nome@exemplo.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
        </div>

        {/* ✅ CORREÇÃO APLICADA AQUI */}
        {status === "error" && (
          <div 
            role="alert" 
            className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <p>{errorMessage}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar Link de Recuperação
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href="/saas" className="text-muted-foreground hover:text-primary underline underline-offset-4">
          Lembrou-se da senha? Voltar ao login
        </Link>
      </div>
    </div>
  );
}