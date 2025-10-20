// jest.config.js
// 1. Usa a sintaxe CommonJS (require/module.exports)
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  
  // 2. Removemos a chave 'transform' explícita
  // O next/jest vai tratar disso automaticamente.

  // 3. Usamos o transformIgnorePatterns focado no problema
  // Esta regex diz ao Jest: "Ignora tudo em /node_modules/ EXCETO 'next-auth' e '@auth/prisma-adapter'".
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|@auth/prisma-adapter).+\\.(js|jsx|ts|tsx)$',
  ],

  // O resto das tuas configurações está ótimo
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  verbose: true,
};

// 4. Usa 'module.exports' para exportar a configuração
module.exports = createJestConfig(customJestConfig);