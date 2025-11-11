// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    // 1. Encontrar o token na BD
    // Usamos findFirst porque o token não é @unique no schema (um e-mail pode ter vários pedidos)
    const storedToken = await prisma.passwordResetToken.findFirst({
      where: { token },
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
    }

    // 2. Verificar Validade (Expiração)
    const hasExpired = new Date(storedToken.expires) < new Date();
    if (hasExpired) {
      // Limpeza opcional: apagar tokens expirados para não sujar a BD
      await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
      return NextResponse.json({ error: 'Token expirado. Peça um novo.' }, { status: 400 });
    }

    // 3. Atualizar a Senha do Utilizador
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação para garantir consistência: Atualiza User E Apaga Token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: storedToken.email },
        data: { hashedPassword },
      }),
      // Apaga TODOS os tokens deste e-mail por segurança (invalida links antigos)
      prisma.passwordResetToken.deleteMany({
        where: { email: storedToken.email },
      }),
    ]);

    return NextResponse.json({ message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}