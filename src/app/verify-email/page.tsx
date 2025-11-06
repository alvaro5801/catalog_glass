// src/app/verify-email/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email');

  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- ✅ NOVA LÓGICA DE TENTATIVA AUTOMÁTICA ---
  
  /**
   * Esta função tenta verificar o token.
   * Se falhar devido a um timeout (erro de JSON), ela tenta novamente.
   */
  const attemptVerification = async (attempt: number) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: token,
        }),
      });

      // A linha que falha com o timeout está aqui
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao verificar o código.');
      }

      // Sucesso!
      setSuccess("E-mail verificado com sucesso! A redirecionar...");
      setIsLoading(false); // Parar o loading
      
      setTimeout(() => {
        router.push('/saas'); // Redirecionar
      }, 2000);

    } catch (error: unknown) { 
      
      // Verificamos se é o nosso erro de timeout E se é a primeira tentativa
      if (error instanceof Error && 
          error.message.includes("Unexpected end of JSON input") && 
          attempt === 1) {
        
        // É um timeout! Vamos esperar 2s e tentar de novo.
        // Não mostramos erro, mantemos o isLoading = true.
        setTimeout(() => {
          attemptVerification(2); // Inicia a segunda tentativa
        }, 2000); // Espera 2 segundos
        
        return; // Sai da função sem mostrar erro
      }

      // Se chegarmos aqui, é um erro real (ex: "Código inválido")
      // ou foi a segunda falha de timeout.
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
      setIsLoading(false); // Parar o loading
    }
  };

  // --- FIM DA NOVA LÓGICA ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email || !token) {
      setError("E-mail ou código em falta.");
      setIsLoading(false);
      return;
    }

    // ✅ MODIFICAÇÃO: Chamamos a nossa nova função de tentativa
    attemptVerification(1); // Inicia a primeira tentativa
  };

  if (!email) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="text-center text-destructive">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold">Erro</h1>
          <p className="mt-2">E-mail não encontrado. Por favor, tente registar-se novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 6rem)' }}>
      <div className="w-full max-w-md space-y-8 bg-background p-8 md:p-10 border rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Verifique o seu E-mail
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enviámos um código de 6 dígitos para <strong>{email}</strong>.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="token">Código de Verificação</Label>
            <Input
              id="token"
              name="token"
              type="text"
              required
              className="mt-1 text-center text-2xl tracking-[0.5em]"
              placeholder="123456"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading || !!success} 
            />
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <p>{success}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading || !!success}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "A verificar..." : "Verificar Conta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}