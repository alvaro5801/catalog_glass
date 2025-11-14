// src/app/login-redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLoginRedirectUrl } from "./actions"; // Importar a nossa nova ação
import { Loader2 } from "lucide-react";

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const resolveRedirect = async () => {
      try {
        // Pede ao servidor o URL correto (Vitrine ou Onboarding)
        const targetUrl = await getLoginRedirectUrl();
        
        console.log("A redirecionar para:", targetUrl);
        router.push(targetUrl);
      } catch (error) {
        console.error("Erro no redirecionamento:", error);
        // Em caso de erro total, manda para o dashboard por segurança
        router.push('/admin/dashboard');
      }
    };

    resolveRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">A entrar na sua loja...</p>
      </div>
    </div>
  );
}