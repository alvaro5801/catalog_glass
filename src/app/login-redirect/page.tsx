// src/app/login-redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // --- LÓGICA DE VERIFICAÇÃO ---
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

    // Adicionamos este log para podermos ver o que está a ser lido do localStorage
    console.log("Onboarding completo?", onboardingComplete);

    if (onboardingComplete) {
      console.log("Redirecionando para: / (Página Principal)");
      router.push('/');
    } else {
      console.log("Redirecionando para: /onboarding (Assistente)");
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground">A autenticar...</p>
    </div>
  );
}