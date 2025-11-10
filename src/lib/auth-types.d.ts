// src/lib/auth-types.d.ts
import 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// Estende a interface do Token JWT
declare module 'next-auth/jwt' {
  /**
   * Extende o tipo de token JWT do NextAuth
   * para incluir a propriedade 'id' (do utilizador).
   */
  interface JWT extends DefaultJWT {
    id: string; // O ID do utilizador é adicionado no callback jwt
  }
}

// Estende a interface da Sessão
declare module 'next-auth' {
  /**
   * Extende o tipo de sessão do NextAuth
   * para incluir a propriedade 'id' no objeto user.
   */
  interface Session {
    user: {
      id: string; // O ID do utilizador é adicionado no callback session
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Adicione aqui outras propriedades que deseja expor no cliente (ex: role)
    } 
  }

  // Estende o objeto User que é retornado pelo authorize/adapter
  interface User {
    id: string; // Garante que o objeto retornado pelo authorize tenha um ID
  }
}