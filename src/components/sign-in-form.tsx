// src/components/sign-in-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      if (result.error.includes("CredentialsSignin")) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError(result.error);
      }
    } else if (result?.ok) {
      router.push("/login-redirect");
    }
  };

  return (
    // O componente agora controla o seu próprio layout
    <div className="w-full sm:w-auto">
      
      {/* 1. O formulário principal (alinhado por 'baseline') */}
      <form
        onSubmit={handleSubmit}
        className="
          flex flex-col sm:flex-row items-baseline gap-2
          w-full
        "
      >
        <Input
          id="login-email"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full sm:w-44 h-9 text-sm"
        />
        <Input
          id="login-password"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full sm:w-36 h-9 text-sm"
        />
        
        {/* ✅ O SEU BOTÃO "ENTRAR" QUE FALTAVA */}
        <Button
          type="submit"
          className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Entrar"
          )}
        </Button>
        
        {/* 2. Botão "Cadastre-se" MOVIDO para aqui */}
        <Button variant="outline" asChild className="h-9 w-full sm:w-auto">
          <Link href="/signup">Cadastre-se</Link>
        </Button>
      </form>

      {/* 3. Links e erros ficam em baixo do formulário */}
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          {/* ✅ CORREÇÃO: Agora aponta para a rota correta de recuperação */}
          <Link href="/forgot-password" className="hover:underline text-blue-600">
            Esqueceu a senha?
          </Link>
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs text-red-600"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}