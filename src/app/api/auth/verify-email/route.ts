// src/app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Importar os tipos do Prisma

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json({ error: 'E-mail e código são obrigatórios.' }, { status: 400 });
    }

    // --- 1. Encontrar o token no banco de dados ---
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: {
        // Agora que o 'prisma generate' corre no build,
        // o 'email_token' é reconhecido corretamente.
        email_token: {
          email: email.toLowerCase(),
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Código inválido ou não encontrado.' }, { status: 404 });
    }

    // --- 2. Verificar se o token expirou ---
    const hasExpired = new Date(verificationToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: 'O código expirou. Por favor, solicite um novo.' }, { status: 410 }); // 410 Gone
    }

    // --- 3. Ativar o Utilizador e Apagar o Token (Transação) ---
    // Adicionar o tipo ao parâmetro 'tx'
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Ativar o utilizador marcando a data de verificação
      await tx.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerified: new Date(),
        },
      });

      // Apagar o token para que não possa ser usado novamente
      await tx.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });
    });

    // --- 4. Sucesso ---
    return NextResponse.json({ message: 'E-mail verificado com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}