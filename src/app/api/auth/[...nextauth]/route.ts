// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter'; 
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';
// ✅ 1. Importar o tipo User para a nossa nova função
import type { User } from 'next-auth'; 

/**
 * ✅ 2. Lógica de autorização extraída para uma função exportada.
 * Isto torna-a diretamente testável!
 */
export async function authorizeCredentials(
  credentials: Record<string, string> | undefined
): Promise<User | null> {
  
  if (!credentials?.email || !credentials?.password) {
    return null; 
  }

  // a) Buscar utilizador e verificar se está ativo
  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email.toLowerCase(),
    },
  });

  // Verifica se o utilizador existe, se tem senha e se verificou o e-mail
  if (!user || !user.hashedPassword || !user.emailVerified) {
    return null; 
  }

  // b) Comparar a senha (RNF02.1)
  const isValidPassword = await bcrypt.compare(
    credentials.password,
    user.hashedPassword
  );

  if (!isValidPassword) {
    return null; // Senha inválida
  }

  // c) Sucesso: Retorna o objeto do utilizador (tipo User do next-auth)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image, 
  };
}


/**
 * Opções de autenticação principais para o Auth.js.
 */
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, 
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  // 3. PROVEDORES: Define os métodos de login
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      // ✅ 3. O provider agora simplesmente CHAMA a nossa função exportada
      async authorize(credentials) {
        return authorizeCredentials(credentials);
      },
    }),
  ],
  
  // Callbacks (iguais a antes)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) { 
            token.id = user.id;
        }
        if (user.name) {
          token.name = user.name;
        } else {
          token.name = undefined;
        }
        if (user.image) {
          token.picture = user.image;
        } else {
          token.picture = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) { 
        session.user.id = token.id; 
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// --- 6. EXPORTAR OS MANIPULADORES DE ROTA ---
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };