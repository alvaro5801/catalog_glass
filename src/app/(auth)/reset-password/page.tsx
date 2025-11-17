// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// Componente principal com Suspense (necessário por usar useSearchParams)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      setStatus("error");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao redefinir senha.");
      }

      setStatus("success");
      // Redirecionar após 3 segundos
      setTimeout(() => router.push("/saas"), 3000);

    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Ocorreu um erro inesperado.");
      }
    }
  };

  // Se não houver token na URL, mostrar erro
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">Link Inválido</h1>
        <p className="text-muted-foreground">O link de recuperação parece estar incompleto.</p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Pedir novo link</Link>
        </Button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="text-xl font-bold">Senha Atualizada!</h1>
        <p className="text-muted-foreground">A sua senha foi alterada com sucesso.</p>
        <p className="text-sm text-muted-foreground">A redirecionar para o login...</p>
        <Button asChild className="w-full mt-4">
          <Link href="/saas">Ir para Login agora</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Nova Senha</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Escolha uma nova senha segura para a sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === "loading"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          Alterar Senha
        </Button>
      </form>
    </div>
  );
}