// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` encapsula a lógica do NextAuth.js
  function middleware(req) {
    // Esta função é chamada se o utilizador ESTIVER autenticado.
    // No futuro, podemos adicionar a lógica de onboarding aqui.
    // Ex: if (!req.nextauth.token.onboardingComplete && req.nextUrl.pathname !== '/onboarding') {
    //   return NextResponse.redirect(new URL('/onboarding', req.url));
    // }

    // Por agora, se estiver autenticado, deixamos passar.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Esta callback é chamada se o `authorized` retornar `false`.
      // Diz ao middleware para onde redirecionar o utilizador.
      authorized: ({ token }) => !!token, // Se houver um token, o utilizador está autorizado.
    },
    // Nota: O `withAuth` irá ler automaticamente a nossa `authOptions`
    // e saber que a página de login é '/saas'./route.ts]
  }
);

// O "matcher" diz ao Next.js quais rotas este middleware deve proteger.
export const config = {
  matcher: [
    "/admin/:path*",     // Proteger toda a área de administração
    "/onboarding/:path*", // Proteger a página de onboarding
  ],
};