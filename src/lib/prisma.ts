// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Adiciona o prisma ao objeto global do Node.js para evitar múltiplas
// instâncias do Prisma Client em ambiente de desenvolvimento.
declare global {
  var prisma: PrismaClient | undefined;
}

// Cria a instância do PrismaClient, reutilizando a instância global se ela existir.
export const prisma = global.prisma || new PrismaClient();

// Em ambientes que não são de produção, guarda a instância no objeto global.
// Isto previne que o "hot-reloading" do Next.js crie novas ligações à base de dados
// a cada alteração de código.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}