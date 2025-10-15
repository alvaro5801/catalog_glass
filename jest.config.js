// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Garante que o nosso ficheiro de setup é executado antes de todos os testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // O ambiente 'jsdom' é o correto para aplicações Next.js que testam tanto UI como API
  testEnvironment: 'jest-environment-jsdom',
  
  // Mapeia o atalho '@/' para a pasta 'src/'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // A linha `preset: 'ts-jest'` foi REMOVIDA daqui para evitar conflitos.
};

module.exports = createJestConfig(customJestConfig);