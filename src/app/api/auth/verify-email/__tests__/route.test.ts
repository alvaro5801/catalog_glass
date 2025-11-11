// src/app/api/auth/verify-email/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// --- MOCK DO PRISMA ---
// Precisamos de uma estrutura que suporte a transação ($transaction)
// A transação recebe uma função e passa um cliente (tx). 
// Vamos simular que 'tx' é o próprio objeto prisma mockado.

// ✅ CORREÇÃO: A definição do mock deve estar DENTRO do jest.mock
// para evitar erros de inicialização (hoisting).
jest.mock('@/lib/prisma', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockPrisma: any = {
    emailVerificationToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  // Simulamos a transação executando o callback imediatamente e passando o próprio mock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockPrisma.$transaction = jest.fn((callback: any) => callback(mockPrisma));

  return {
    prisma: mockPrisma,
  };
});

// Importar a referência mockada para usar nos testes e asserções
import { prisma } from '@/lib/prisma';

describe('API Route: /api/auth/verify-email', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. VALIDAÇÃO DE CAMPOS
  it('🚫 deve retornar 400 se faltar email ou token', async () => {
    const req = new NextRequest('http://localhost/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: '', token: '' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('E-mail e código são obrigatórios.');
  });

  // 2. TOKEN NÃO ENCONTRADO
  it('🚫 deve retornar 404 se o token não for encontrado', async () => {
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com', token: '123456' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Código inválido ou não encontrado.');
  });

  // 3. TOKEN EXPIRADO
  it('🚫 deve retornar 410 se o token estiver expirado', async () => {
    // Data no passado (1 hora atrás)
    const pastDate = new Date(Date.now() - 3600000); 

    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token_id',
      expires: pastDate,
    });

    const req = new NextRequest('http://localhost/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com', token: '123456' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(410); // Gone
    expect(body.error).toMatch(/expirou/);
    // Não deve iniciar transação
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  // 4. SUCESSO (HAPPY PATH)
  it('✅ deve verificar com sucesso, atualizar utilizador e apagar token', async () => {
    // Data no futuro (1 hora à frente)
    const futureDate = new Date(Date.now() + 3600000);

    const mockTokenData = {
      id: 'token_id_123',
      userId: 'user_id_456',
      expires: futureDate,
    };

    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue(mockTokenData);
    
    // Como mockámos o $transaction para executar o callback, 
    // as chamadas internas (update e delete) serão executadas no nosso mockPrisma.
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user_id_456', emailVerified: new Date() });
    (prisma.emailVerificationToken.delete as jest.Mock).mockResolvedValue({ id: 'token_id_123' });

    const req = new NextRequest('http://localhost/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com', token: '123456' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('E-mail verificado com sucesso!');

    // Verificações da Lógica
    expect(prisma.$transaction).toHaveBeenCalled();
    
    // Verifica se ativou o utilizador
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockTokenData.userId },
      data: { emailVerified: expect.any(Date) },
    });

    // Verifica se apagou o token
    expect(prisma.emailVerificationToken.delete).toHaveBeenCalledWith({
      where: { id: mockTokenData.id },
    });
  });

  // 5. ERRO DE SERVIDOR
  it('🚫 deve retornar 500 em caso de erro inesperado', async () => {
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockRejectedValue(new Error('Erro de BD'));

    const req = new NextRequest('http://localhost/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com', token: '123456' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Ocorreu um erro interno no servidor.');
  });
});