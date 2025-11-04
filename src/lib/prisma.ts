// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 1. Define um objeto global "tipado" (typed) para guardar a instância do Prisma.
//    Isto é a "best practice" recomendada pela própria Prisma para o Next.js.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. Cria a instância do PrismaClient.
//    - Tenta reutilizar a instância global (globalForPrisma.prisma) se ela já existir.
//    - Se não existir (??), cria uma nova (`new PrismaClient()`).
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 3. Em ambiente de DESENVOLVIMENTO, guarda a instância no objeto global.
//    Isto previne que o "hot-reloading" do Next.js crie novas ligações
//    a cada alteração de código.
//    (Em produção, isto não é executado, e o 'prisma' exportado
//    acima é reutilizado naturalmente pelo sistema de módulos).
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}