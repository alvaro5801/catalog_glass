// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Fornece o caminho para a sua aplicação Next.js
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Define a raiz do projeto
  rootDir: '.',

  // Ficheiros de setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Ajuda o Jest a encontrar módulos
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Mapeamento do alias '@/' (O seu código original)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // --- ✅ CORREÇÃO DEFINITIVA ---
  // Define o ambiente E as opções dele
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    /**
     * @see https://github.com/facebook/jest/issues/14358
     * @see https://github.com/jsdom/jsdom/issues/3363
     * * Isto força o Jest (que está a correr no Node) a usar as exportações 
     * "node" (CJS) do pacote 'jose' em vez das exportações "browser" (ESM),
     * que o Jest/Node não consegue processar.
     */
    customExportConditions: ['node', 'require', 'default'],
  },
  // ------------------------------
};

// createJestConfig é uma função assíncrona que exporta a configuração do Jest
module.exports = createJestConfig(customJestConfig);