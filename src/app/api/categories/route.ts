// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

// ID do catálogo de demonstração (para quando ninguém está logado)
const DEMO_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// ✅ GET: Inteligente (Usa o catálogo do user se logado, senão usa Demo)
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    let catalogId = DEMO_CATALOG_ID;

    // Se estiver logado, tentamos usar o catálogo dele
    if (user && user.email) {
        try {
            catalogId = await getUserCatalogId(user.email);
        } catch (error) {
            console.warn("Aviso: Não foi possível carregar catálogo do utilizador, a mostrar demo.", error);
        }
    }

    // Busca categorias filtradas pelo catálogo correto
    const categories = await prisma.category.findMany({
      where: { catalogId },
      orderBy: { name: 'asc' }, // Ordenar alfabeticamente
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: "Erro interno ao buscar categorias" }, { status: 500 });
  }
}

// ✅ POST: Protegido (Cria APENAS no catálogo do utilizador)
export async function POST(request: Request) {
  try {
    // 1. Auth Check: Só quem está logado pode criar
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado. Faça login." }, { status: 401 });
    }

    // 2. Validar Input
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "O nome deve ter pelo menos 2 caracteres." }, { status: 400 });
    }

    // 3. Obter o ID do Catálogo do Utilizador (CRÍTICO)
    // Esta função garante que obtemos o ID correto ou cria um catálogo se não existir
    const catalogId = await getUserCatalogId(user.email);

    // 4. Verificar Duplicados (Regra de Negócio)
    const existing = await prisma.category.findUnique({
        where: {
            name_catalogId: {
                name: name,
                catalogId: catalogId
            }
        }
    });

    if (existing) {
        return NextResponse.json({ error: "Esta categoria já existe no seu catálogo." }, { status: 409 });
    }

    // 5. Criar na Base de Dados
    const newCategory = await prisma.category.create({
      data: {
        name,
        catalogId, // ✅ Aqui está a correção: ligamos explicitamente ao catálogo
      },
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json({ error: "Erro interno ao criar categoria." }, { status: 500 });
  }
}