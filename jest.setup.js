// jest.setup.js

// 1. Adiciona matchers do jest-dom, como .toBeInTheDocument()
import '@testing-library/jest-dom';

// 2. Importa as ferramentas de limpeza
import { cleanup } from '@testing-library/react';
import { afterEach } from '@jest/globals';

// --- Polyfills para o ambiente de teste do Node.js ---

// 3. Importa as APIs que faltam do próprio Node.js
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'node:stream/web';
import { MessageChannel } from 'node:worker_threads';

// 4. Torna as APIs básicas disponíveis globalmente
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

const channel = new MessageChannel();
global.MessageChannel = MessageChannel;
global.MessagePort = channel.port1.constructor;

// 5. Agora, com o ambiente preparado, importa o 'undici' para as APIs de rede
const { Request, Response, Headers, FormData, fetch } = require('undici');

// 6. Torna as APIs de rede globais
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.FormData = FormData;
global.fetch = fetch;


// 7. Executa a limpeza após cada teste
// Isto resolve o aviso "A worker process has failed to exit gracefully"
afterEach(() => {
  cleanup();
});