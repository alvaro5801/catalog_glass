// src/app/api/auth/forgot-password/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// --- MOCKS ---
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/email', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Importar mocks para asserções
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

describe('API Route: /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock da variável de ambiente para o link do e-mail
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  });

  it('🚫 deve retornar 400 se o e-mail não for enviado', async () => {
    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('E-mail é obrigatório.');
  });

  it('✅ deve retornar 200 OK (falso positivo) se o utilizador não existir', async () => {
    // Simular que não encontrou utilizador
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'naoexiste@teste.com' }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(200); // Retorna sucesso por segurança
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled(); // Mas não cria token
    expect(sendPasswordResetEmail).not.toHaveBeenCalled(); // Nem envia email
  });

  it('✅ deve criar token e enviar e-mail se o utilizador existir', async () => {
    // Simular utilizador existente
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ 
      id: 'user-1', 
      email: 'existe@teste.com' 
    });

    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'existe@teste.com' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    
    // 1. Verificou se o user existe?
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existe@teste.com' }
    });

    // 2. Criou o token na BD?
    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        email: 'existe@teste.com',
        token: expect.any(String), // Token gerado
        expires: expect.any(Date),
      },
    });

    // 3. Enviou o e-mail?
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'existe@teste.com',
      expect.stringContaining('http://localhost:3000/reset-password?token=')
    );
  });
});