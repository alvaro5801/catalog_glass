// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Função POST para criar um novo utilizador (Registo)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validar os dados de entrada
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    // 2. Verificar se o utilizador já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 }); // 409 Conflict
    }

    // 3. Fazer o "hash" da senha
    // O "salt" (10) é o custo do hashing, 10-12 é um valor padrão seguro
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Criar o novo utilizador na base de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Nota: O stripeCustomerId será adicionado num passo futuro (RF01.3)
      },
    });

    // 5. Retornar o utilizador criado (sem a senha)
    // Remover a senha do objeto antes de o retornar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}