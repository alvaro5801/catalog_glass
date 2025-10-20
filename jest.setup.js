// jest.setup.js

// 1. Adiciona matchers do jest-dom
import '@testing-library/jest-dom';

// 2. Importa as ferramentas de limpeza e hooks do Jest
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll } from '@jest/globals'; // ✅ Adicionado 'afterAll'

// ✅ 3. Adicionado para a lógica de desconexão do Prisma
import { prisma } from './src/lib/prisma';

// --- Polyfills para o ambiente de teste do Node.js ---
// (Esta seção permanece igual ao que tinhas)
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'node:stream/web';
import { MessageChannel } from 'node:worker_threads';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// @ts-ignore
global.ReadableStream = ReadableStream;

const channel = new MessageChannel();
// @ts-ignore
global.MessageChannel = MessageChannel;
// @ts-ignore
global.MessagePort = channel.port1.constructor;

const { Request, Response, Headers, FormData, fetch } = require('undici');
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.FormData = FormData;
global.fetch = fetch;


// --- Mocks para APIs do Browser ---
// (Esta seção permanece igual ao que tinhas)

// Simula a IntersectionObserver para o <Link> do Next.js
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Simula requestIdleCallback para evitar avisos de "act(...)" com o <Link> do Next.js
global.requestIdleCallback = jest.fn((callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1;
});

global.cancelIdleCallback = jest.fn();

jest.mock('next/link', () => {
  return ({ href, children, ...rest }) => {
    return (
      <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
        {children}
      </a>
    );
  };
});


// --- Lógica de Limpeza dos Testes ---

// Executa a limpeza do React Testing Library após cada teste
afterEach(() => {
  cleanup();
});

// ✅ 4. CÓDIGO ADICIONADO: Desconecta o Prisma após TODOS os testes
// Esta função é executada uma única vez, garantindo que a conexão com a base de dados
// é encerrada de forma limpa, resolvendo o aviso "worker process has failed to exit gracefully".
afterAll(async () => {
  await prisma.$disconnect();
});