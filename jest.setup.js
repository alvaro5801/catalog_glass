// jest.setup.js

// 1. Adiciona matchers do jest-dom
import '@testing-library/jest-dom';

// 2. Importa as ferramentas de limpeza
import { cleanup } from '@testing-library/react';
import { afterEach } from '@jest/globals';

// --- Polyfills para o ambiente de teste do Node.js ---
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

// 7. Simula a IntersectionObserver para o <Link> do Next.js
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;


// ✅ 8. A SOLUÇÃO FINAL ADICIONADA AQUI
// Simula requestIdleCallback e cancelIdleCallback. O <Link> do Next.js usa esta
// API para agendar o IntersectionObserver, e a sua simulação com setTimeout
// em JSDOM causa o aviso "act(...)". Ao simular, tornamos a chamada síncrona.
global.requestIdleCallback = jest.fn((callback) => {
  // Executa o callback imediatamente com um objeto 'deadline' simulado.
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1; // Retorna um ID de handle falso
});

global.cancelIdleCallback = jest.fn();

jest.mock('next/link', () => {
  // Força o componente Link a renderizar apenas o <a> direto, sem efeitos.
  return ({ href, children, ...rest }) => {
    return (
      <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
        {children}
      </a>
    );
  };
});


// 9. Executa a limpeza após cada teste
afterEach(() => {
  cleanup();
});