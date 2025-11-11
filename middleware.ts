// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Se o utilizador tentar aceder a uma rota protegida sem estar logado,
  // será redirecionado para aqui:
  pages: {
    signIn: "/saas", // A tua página de login
  },
});

export const config = {
  /*
   * O matcher define quais rotas o middleware vai "vigiar".
   * Se a rota estiver aqui, o utilizador TEM de estar logado.
   */
  matcher: [
    // 1. Protege todo o painel administrativo
    "/admin/:path*",
    
    // 2. Protege o fluxo de onboarding
    "/onboarding/:path*",
    
    // 3. Protege a rota de redirecionamento pós-login
    "/login-redirect",
  ],
};