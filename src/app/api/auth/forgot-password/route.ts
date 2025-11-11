// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email'; // Vamos criar esta função a seguir

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    // 1. Verificar se o utilizador existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // ⚠️ SEGURANÇA: Mesmo que o e-mail não exista, retornamos 200 OK.
    // Isto previne "Enumeração de Utilizadores" (hackers descobrirem quem tem conta).
    if (!user) {
      return NextResponse.json({ message: 'Se o e-mail existir, enviámos um link.' });
    }

    // 2. Gerar Token Seguro
    // Usamos crypto.randomBytes para criar um token longo e imprevisível
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // Expira em 1 hora

    // 3. Salvar na Base de Dados
    // O Prisma cria o registo na tabela PasswordResetToken
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expires: tokenExpiry,
      },
    });

    // 4. Enviar E-mail
    // O link será algo como: https://teusite.com/reset-password?token=...
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return NextResponse.json({ message: 'Se o e-mail existir, enviámos um link.' });

  } catch (error) {
    console.error('Erro ao pedir reset de senha:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}