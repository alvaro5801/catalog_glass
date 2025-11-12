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
  // 1. Encontrar o utilizador na BD
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { catalogs: true }, // Incluir os catálogos
  });

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  // 2. Verificar se já tem catálogo
  let catalog = user.catalogs[0];

  // 3. Se não tiver (primeira vez), criamos um automaticamente
  if (!catalog) {
    catalog = await prisma.catalog.create({
      data: {
        userId: user.id,
      },
    });
  }

  return catalog.id;
}