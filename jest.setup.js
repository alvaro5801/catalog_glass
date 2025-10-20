// jest.setup.js

// 1️⃣ Adiciona matchers do jest-dom (para testes de componentes React)
import '@testing-library/jest-dom';

// 2️⃣ Importa ferramentas de limpeza e hooks do Jest
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll } from '@jest/globals';

// 3️⃣ Desconexão do Prisma após todos os testes (evita avisos de processos abertos)
import { prisma } from './src/lib/prisma';

// --- 🌐 Polyfills para ambiente Node.js em testes ---
// Necessários para o Next.js e Fetch API funcionar no Jest
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

// --- 🧩 Mocks para APIs do Browser usadas pelo Next.js ---
// Só executa essas partes se o ambiente de teste tiver 'window' (jsdom)
if (typeof window !== 'undefined') {
  // Simula o IntersectionObserver usado internamente por <Link>
  const mockIntersectionObserver = jest.fn(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));

  window.IntersectionObserver = mockIntersectionObserver;

  // Simula requestIdleCallback e cancelIdleCallback (evita warnings com <Link>)
  global.requestIdleCallback = jest.fn((callback) => {
    callback({ didTimeout: false, timeRemaining: () => 50 });
    return 1;
  });

  global.cancelIdleCallback = jest.fn();
}

// --- 🔗 Mocks de módulos do Next.js ---
// Mock básico de next/link
jest.mock('next/link', () => {
  return ({ href, children, ...rest }) => {
    return (
      <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
        {children}
      </a>
    );
  };
});

// Mock de next/router (para versões antigas)
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock de next/navigation (para App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// --- 🧹 Limpeza dos testes ---
// Limpa o DOM após cada teste (boa prática com React Testing Library)
afterEach(() => {
  cleanup();
});

// Fecha a conexão com o Prisma após todos os testes (evita travamentos e avisos)
afterAll(async () => {
  await prisma.$disconnect();
});
