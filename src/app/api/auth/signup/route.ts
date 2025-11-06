// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Para gerar o token
import { sendVerificationEmail } from '@/lib/email'; // O nosso serviço de e-mail

const TOKEN_EXPIRATION_HOURS = 1;

/**
 * Gera um token numérico aleatório de 6 dígitos.
 */
function generateVerificationToken(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está em utilização.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + TOKEN_EXPIRATION_HOURS);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        hashedPassword: hashedPassword,
        emailVerified: null, 
        verificationTokens: {
          create: {
            email: email.toLowerCase(),
            token: verificationToken,
            expires: expires,
          },
        },
      },
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    return NextResponse.json({
      message: 'Utilizador criado com sucesso! Verifique o seu e-mail.',
      email: newUser.email,
    }, { status: 201 });

  } catch (error) {
    console.error("Erro no cadastro:", error);
    if (error instanceof Error && error.message.includes("e-mail")) {
      return NextResponse.json({ error: "Utilizador criado, mas falha ao enviar e-mail de verificação." }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}