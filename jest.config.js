// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Fornece o caminho para a sua aplicação Next.js para carregar as configurações de .env
  dir: './',
});

// Adicione qualquer configuração personalizada do Jest que desejar aqui
const customJestConfig = {
  // Garante que o nosso ficheiro de setup é executado antes de todos os testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // O ambiente 'jsdom' simula um browser, essencial para testar componentes React
  testEnvironment: 'jest-environment-jsdom',
  
  // Mapeia o atalho '@/' para a pasta 'src/', para que as importações funcionem
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// createJestConfig é uma função assíncrona que exporta a configuração do Jest
// para que o Next.js possa garantir que as transformações do SWC são carregadas
module.exports = createJestConfig(customJestConfig);