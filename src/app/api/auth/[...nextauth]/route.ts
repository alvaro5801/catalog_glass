// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter'; 
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';
import type { User } from 'next-auth'; 
import { ratelimit } from '@/lib/ratelimit'; // ✅ 1. Importar o limitador

/**
 * Lógica de autorização unificada.
 * Suporta:
 * 1. Login Clássico (Email + Senha)
 * 2. Verificação/Login Automático (Email + Token de Verificação)
 */
export async function authorizeCredentials(
  credentials: Record<string, string> | undefined
): Promise<User | null> {
  
  if (!credentials?.email) {
    return null; 
  }

  const email = credentials.email.toLowerCase();

  // --- ✅ 2. VERIFICAÇÃO DE RATE LIMIT (Baseada no Email) ---
  // Protege contra ataques de força bruta (RNF02.1.1).
  // Impede que alguém tente adivinhar a senha do MESMO e-mail muitas vezes.
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const { success } = await ratelimit.limit(`login_${email}`);
      
      if (!success) {
        throw new Error("Muitas tentativas. Tente novamente em 1 minuto.");
      }
    } catch (error) {
      // Se o erro for o nosso de limite, relançamos para o NextAuth apanhar
      if (error instanceof Error && error.message.includes("Muitas tentativas")) {
        throw error;
      }
      // Se for erro de rede/Redis, logamos mas deixamos passar (fail-open) para não bloquear utilizadores
      console.error("Erro no Rate Limit (Login):", error);
    }
  }
  // -----------------------------------------------------

  // --- CASO 1: Login via Token de Verificação (RF01.4) ---
  // Se o frontend enviou um 'token', tentamos validar por este método primeiro.
  if (credentials.token) {
    // a) Procurar o token na base de dados
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: {
        email_token: {
          email: email,
          token: credentials.token,
        },
      },
      include: {
        user: true, // Incluir o utilizador para o retorno
      },
    });

    // b) Validar se o token existe
    if (!verificationToken) return null;
    
    // c) Validar se o token expirou
    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) return null;

    // d) SUCESSO: Ativar utilizador e apagar token (Transação)
    // Usamos transaction para garantir consistência
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    // e) Retornar o utilizador (o NextAuth cria a sessão automaticamente!)
    return {
      id: verificationToken.user.id,
      email: verificationToken.user.email,
      name: verificationToken.user.name,
      image: verificationToken.user.image, 
    };
  }

  // --- CASO 2: Login Clássico (Email + Senha) ---
  // Se não há token, mas há senha, seguimos o fluxo normal.
  if (credentials.password) {
    // a) Buscar utilizador
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // b) Verificar se o utilizador existe, tem senha e se o e-mail está verificado
    if (!user || !user.hashedPassword || !user.emailVerified) {
      return null; 
    }

    // c) Comparar a senha (RNF02.1)
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      return null; // Senha inválida
    }

    // d) Sucesso
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image, 
    };
  }

  // Se não entrou em nenhum caso acima
  return null;
}


/**
 * Opções de autenticação principais para o Auth.js.
 */
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, 
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // 3. PROVEDORES: Define os métodos de login
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
        token: { label: 'Token', type: 'text' }, // Adicionado para o NextAuth saber que este campo existe
      },
      // O provider agora simplesmente CHAMA a nossa função exportada
      async authorize(credentials) {
        return authorizeCredentials(credentials);
      },
    }),
  ],
  
  // Callbacks para popular a sessão com dados do utilizador
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) { 
            token.id = user.id;
        }
        if (user.name) {
          token.name = user.name;
        }
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) { 
        session.user.id = token.id as string; 
      }
      return session;
    },
  },

  // Página personalizada de login (para redirecionamentos automáticos)
  pages: {
    signIn: '/saas',
  },

  debug: process.env.NODE_ENV === 'development',
};

// --- 6. EXPORTAR OS MANIPULADORES DE ROTA ---
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };