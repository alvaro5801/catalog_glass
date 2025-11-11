// src/lib/__mocks__/prisma.ts

export const prisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(), // Necessário para o update do emailVerified
  },
  emailVerificationToken: {
    findUnique: jest.fn(),
    delete: jest.fn(), // Necessário para apagar o token após uso
  },
  // Mock simples para transação: resolve imediatamente
  $transaction: jest.fn((promises) => Promise.resolve(promises)),
};