// src/lib/auth-helper.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return null;
  }

  return session.user;
}

export async function getUserCatalogId(userEmail: string): Promise<string> {
  // 1. Tenta encontrar o user e os catálogos
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { catalogs: true },
  });

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  // 2. Verifica se já existe catálogo
  let catalog = user.catalogs[0];

  // 3. Se não existir, cria um novo (AGORA COM SLUG OBRIGATÓRIO)
  if (!catalog) {
    // Lógica simples para gerar slug único: parte do email + números aleatórios
    // Ex: "joao" + "-8473" = "joao-8473"
    const baseSlug = userEmail.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const uniqueSuffix = Math.floor(Math.random() * 10000);
    const finalSlug = `${baseSlug}-${uniqueSuffix}`;

    catalog = await prisma.catalog.create({
      data: {
        userId: user.id,
        slug: finalSlug, // ✅ Campo obrigatório preenchido
      },
    });
  }

  return catalog.id;
}