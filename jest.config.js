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

  // Ficheiros de setup (se você tiver um 'jest.setup.js', mantenha)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // O ambiente de teste
  testEnvironment: 'jest-environment-jsdom',

  // --- VERIFIQUE ESTA PARTE COM ATENÇÃO ---
  moduleNameMapper: {
    // A regra para mapear '@/' para 'src/'
    // Garanta que as aspas, barras e o '$1' estão corretos.
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ajuda o Jest a encontrar módulos (Esta linha veio da branch 'feature/test')
  moduleDirectories: ['node_modules', '<rootDir>/'],
};

// createJestConfig é uma função assíncrona que exporta a configuração do Jest
// para que o Next.js possa garantir que as transformações do SWC são carregadas. (Este comentário veio da branch 'main')
module.exports = createJestConfig(customJestConfig);