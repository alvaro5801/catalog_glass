// src/app/api/auth/reset-password/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// --- MOCKS ---
jest.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    // Mock simples para transação (executa e retorna o array de promessas)
    $transaction: jest.fn((promises) => Promise.resolve(promises)),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_new_password'),
}));

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('API Route: /api/auth/reset-password', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('🚫 deve retornar 400 se faltar token ou senha', async () => {
    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: '', password: '' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Token e nova senha são obrigatórios.');
  });

  it('🚫 deve retornar 400 se o token for inválido (não encontrado)', async () => {
    (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalido', password: '123' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Token inválido ou expirado.');
  });

  it('🚫 deve retornar 400 se o token estiver expirado', async () => {
    // Data no passado
    const expiredDate = new Date(Date.now() - 10000);
    
    (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue({
      id: 'token-id',
      email: 'teste@exemplo.com',
      expires: expiredDate,
    });

    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'expirado', password: '123' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Token expirado. Peça um novo.');
    // Deve tentar apagar o token expirado
    expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({ where: { id: 'token-id' } });
  });

  it('✅ deve atualizar a senha com sucesso se tudo estiver válido', async () => {
    // Data no futuro
    const validDate = new Date(Date.now() + 3600000);
    
    (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue({
      id: 'token-id',
      email: 'teste@exemplo.com',
      token: 'token-valido',
      expires: validDate,
    });

    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'token-valido', password: 'nova_senha_secreta' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Senha atualizada com sucesso!');

    // 1. Hasheou a senha?
    expect(bcrypt.hash).toHaveBeenCalledWith('nova_senha_secreta', 10);

    // 2. Executou a transação?
    expect(prisma.$transaction).toHaveBeenCalled();

    // 3. Verificações dentro da transação (update user e delete tokens)
    expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' },
        data: { hashedPassword: 'hashed_new_password' }
    });
    
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' }
    });
  });
});