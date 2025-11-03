// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declara um 'global' para evitar múltiplas instâncias em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

// Cria a instância do Prisma, reutilizando a instância 'global' se existir
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}