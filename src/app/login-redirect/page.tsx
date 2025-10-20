"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected.current) return;

    const handleRedirect = async () => {
      // Aguarda um pequeno tempo para simular comportamento real
      await new Promise((resolve) => setTimeout(resolve, 20));

      console.log("Status da sessão:", status);
      console.log("Sessão atual:", session);

      if (status === "loading") {
        // Ainda carregando -> apenas mostra o estado
        return;
      }

      hasRedirected.current = true;

      if (status === "unauthenticated") {
        console.log("Usuário não autenticado → /saas");
        router.push("/saas");
        return;
      }

      if (status === "authenticated") {
        const onboardingComplete = session?.user?.onboardingComplete === true;

        console.log("Onboarding completo?", onboardingComplete);

        if (onboardingComplete) {
          console.log("Redirecionando → /admin/dashboard");
          router.push("/admin/dashboard");
        } else {
          console.log("Redirecionando → /onboarding");
          router.push("/onboarding");
        }
      }

      setIsChecking(false);
    };

    handleRedirect();
  }, [status, session, router]);

  if (status === "loading" || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">A autenticar...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
