// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Retornado pela `useSession`, `getSession` e recebido como prop pelo `SessionProvider`.
   */
  interface Session {
    user: {
      /** O ID do utilizador vindo da base de dados. */
      id: string;
      /** Flag que indica se o utilizador completou o onboarding. */
      onboardingComplete?: boolean; // Usamos opcional para segurança
    } & DefaultSession["user"]; // Mantém as propriedades padrão (name, email, image)
  }

  /** O tipo do objeto User como retornado pela função `authorize` e pelo adapter. */
  interface User extends DefaultUser {
    id: string;
    /** Flag que indica se o utilizador completou o onboarding. */
    onboardingComplete?: boolean;
    // Pode adicionar outras propriedades aqui se necessário no futuro
  }
}

declare module "next-auth/jwt" {
  /** Retornado pela `getToken` e recebido como prop pela `useSession` */
  interface JWT {
    /** O ID do utilizador */
    id?: string; // Usamos opcional aqui para evitar erros em alguns fluxos
    /** Flag que indica se o utilizador completou o onboarding. */
    onboardingComplete?: boolean;
  }
}