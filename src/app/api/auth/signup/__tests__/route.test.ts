// src/app/api/auth/signup/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// --- MOCKS (Simulações) ---

// 1. Mock do Prisma (Base de Dados)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// 2. Mock do Bcrypt (Segurança)
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// 3. Mock do E-mail
jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn(),
}));

// 4. Mock do Rate Limit (O novo mecanismo)
jest.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: jest.fn(),
  },
}));

// Importar as referências para poder controlar os mocks nos testes
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import { ratelimit } from '@/lib/ratelimit';

describe('API Route: /api/auth/signup', () => {
  // Guardar o ambiente original para restaurar depois
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Forçar a existência da variável de ambiente para ativar o Rate Limit no teste
    process.env = { ...originalEnv, UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.com' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // 🛡️ TESTE 1: SEGURANÇA
  it('🚫 deve bloquear a requisição se o rate limit for excedido (429)', async () => {
    // Simular que o limitador diz "NÃO" (success: false)
    (ratelimit.limit as jest.Mock).mockResolvedValue({ success: false });

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Atacante', email: 'spam@teste.com', password: '123' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toMatch(/Demasiadas tentativas/);
    // Garantir que não tentou ir à base de dados
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  // 📝 TESTE 2: VALIDAÇÃO
  it('🚫 deve retornar 400 se faltarem campos obrigatórios', async () => {
    (ratelimit.limit as jest.Mock).mockResolvedValue({ success: true }); // Passa no rate limit

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: '', password: '' }), // Dados vazios
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Todos os campos são obrigatórios.');
  });

  // 👤 TESTE 3: LÓGICA DE NEGÓCIO (Duplicado)
  it('🚫 deve retornar 409 se o e-mail já estiver em uso', async () => {
    (ratelimit.limit as jest.Mock).mockResolvedValue({ success: true });
    // Simular que o prisma encontrou um utilizador
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'existe@teste.com' });

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'User', email: 'existe@teste.com', password: '123' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe('Este e-mail já está em utilização.');
  });

  // ✅ TESTE 4: SUCESSO (Happy Path)
  it('✅ deve criar utilizador, gerar hash, enviar email e retornar 201', async () => {
    // 1. Preparar mocks de sucesso
    (ratelimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Utilizador não existe
    (bcrypt.hash as jest.Mock).mockResolvedValue('senha_super_secreta_hash'); // Hash falso
    (prisma.user.create as jest.Mock).mockResolvedValue({ 
      id: 'novo_user_123', 
      email: 'novo@teste.com' 
    });
    (sendVerificationEmail as jest.Mock).mockResolvedValue(true);

    // 2. Fazer a requisição
    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Novo User', email: 'novo@teste.com', password: '123' }),
    });

    const res = await POST(req);
    const body = await res.json();

    // 3. Verificações
    expect(res.status).toBe(201);
    expect(body.message).toContain('sucesso');

    // Verificações detalhadas de chamadas
    expect(bcrypt.hash).toHaveBeenCalledWith('123', 10); // A senha foi hasheada?
    
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: 'novo@teste.com',
        hashedPassword: 'senha_super_secreta_hash',
        // Verifica se a estrutura do token foi criada
        emailVerificationTokens: expect.objectContaining({
          create: expect.any(Object)
        })
      })
    }));

    expect(sendVerificationEmail).toHaveBeenCalledWith('novo@teste.com', expect.any(String));
  });
});