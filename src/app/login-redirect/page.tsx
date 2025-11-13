// src/app/login-redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se o onboarding foi completado (baseado na flag local)
    // Nota: Idealmente, isto deveria vir da sessão do utilizador no futuro
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

    console.log("Onboarding completo?", onboardingComplete);

    if (onboardingComplete) {
      // ✅ CORREÇÃO: Redirecionar para o Painel Admin, não para a Home pública
      console.log("Redirecionando para: /admin/dashboard");
      router.push('/admin/dashboard');
    } else {
      console.log("Redirecionando para: /onboarding (Assistente)");
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground font-medium">A entrar no painel...</p>
      </div>
    </div>
  );
}