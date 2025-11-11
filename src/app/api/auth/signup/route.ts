// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Para gerar o token
import { sendVerificationEmail } from '@/lib/email'; // O nosso serviço de e-mail
import { ratelimit } from '@/lib/ratelimit'; // ✅ 1. Importar o limitador

const TOKEN_EXPIRATION_HOURS = 1;

/**
 * Gera um token numérico aleatório de 6 dígitos.
 */
function generateVerificationToken(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  try {
    // --- ✅ 2. VERIFICAÇÃO DE RATE LIMIT (Início) ---
    // Identificar o utilizador pelo IP (para prevenir criação de contas em massa a partir do mesmo local)
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Verificar se deve bloquear (apenas se as credenciais do Upstash estiverem configuradas)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { success } = await ratelimit.limit(`signup_${ip}`);

      if (!success) {
        return NextResponse.json(
          { error: "Demasiadas tentativas. Por favor tente novamente mais tarde." },
          { status: 429 } // Too Many Requests
        );
      }
    }
    // --- FIM DA VERIFICAÇÃO ---

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
        // ✅ Criação do token aninhada (relação correta)
        emailVerificationTokens: {
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