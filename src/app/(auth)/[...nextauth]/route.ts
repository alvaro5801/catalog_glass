// src/app/(auth)/[...nextauth]/route.ts
import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter"; // 1. REMOVIDA
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
// import type { Adapter } from "next-auth/adapters"; // 2. REMOVIDA
import type { NextAuthOptions } from "next-auth"; // Importar o tipo

// Definimos as opções de autenticação
export const authOptions: NextAuthOptions = {
  // Usar o Prisma Adapter para ligar à base de dados
  // adapter: PrismaAdapter(prisma) as Adapter, // 3. REMOVIDA

  // Definir os provedores de autenticação
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // Lógica de autorização (Login)
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // Se o utilizador não for encontrado ou não tiver senha (ex: registo incompleto)
          throw new Error("Utilizador não encontrado ou senha não configurada.");
        }

        // Verificar se a senha fornecida corresponde à senha "hashed" na base de dados
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Senha inválida.");
        }

        // ✅ Se a senha for válida, retorna o objeto do utilizador para o NextAuth,
        // incluindo a flag onboardingComplete.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingComplete: user.onboardingComplete, // <-- Adicionado aqui
        };
      },
    }),
  ],

  // Configurar a estratégia de sessão para JWT
  session: {
    strategy: "jwt" as const,
  },

  // Definir o segredo da aplicação
  secret: process.env.AUTH_SECRET,

  // Páginas personalizadas
  pages: {
    // A nossa página /saas agora é a página de login oficial
    signIn: '/saas',
    // Podemos criar uma página de erro personalizada se quisermos
    error: '/saas',
  },

  // ✅ Adicionar as Callbacks jwt e session
  callbacks: {
    async jwt({ token, user }) {
      // No login inicial (objeto 'user' está presente, vindo da função authorize)
      if (user) {
        token.id = user.id;
        // Adiciona a propriedade onboardingComplete ao token JWT
        // @ts-ignore - Usamos para evitar erro de tipo se 'User' não tiver sido atualizado em next-auth.d.ts ainda
        token.onboardingComplete = user.onboardingComplete;
      }
      return token; // Retorna o token (atualizado ou não)
    },
    async session({ session, token }) {
      // Esta callback recebe o token JWT (processado pela callback 'jwt')
      // e o objeto de sessão padrão. Adicionamos as informações do token à sessão.
      if (token && session.user) {
        session.user.id = token.id as string; // Adiciona o ID do utilizador
        // Adiciona a propriedade onboardingComplete à sessão
        // @ts-ignore - Usamos para evitar erro de tipo se 'Session' não tiver sido atualizado em next-auth.d.ts ainda
        session.user.onboardingComplete = token.onboardingComplete;
      }
      return session; // Retorna a sessão modificada
    },
  },
};

// Exportar os handlers GET e POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };