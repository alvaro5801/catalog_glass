// src/lib/__mocks__/prisma.ts

// Exportamos uma simulação da instância do prisma.
// O 'jest.fn()' permite que os nossos testes "espiem" estas funções.
export const prisma = {
  user: {
    findUnique: jest.fn(),
  },
  // NOTA: Se outros testes precisarem de mockar outros modelos 
  // (ex: emailVerificationToken), terás de os adicionar aqui.
  // Por agora, o 'user.findUnique' é o único que o nextauth.test.ts precisa.
};