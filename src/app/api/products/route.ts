// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

// GET: Listar produtos
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json([], { status: 401 });

    const catalogId = await getUserCatalogId(user.email);

    const products = await prisma.product.findMany({
      where: { catalogId },
      include: {
        category: true,
        priceTable: true,
        specifications: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// POST: Criar produto
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validação básica
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const catalogId = await getUserCatalogId(user.email);

    // Gerar slug se não vier no body (para garantir unicidade)
    let productSlug = body.slug;
    if (!productSlug) {
      const baseSlug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      productSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: productSlug,
        shortDescription: body.shortDescription || "",
        description: body.description || "",
        priceInfo: String(body.price),
        isFeatured: body.isFeatured || false,
        images: body.images || [],
        catalogId: catalogId,
        categoryId: body.categoryId,
        priceTable: { create: [{ quantity: "1", price: Number(body.price) }] },
        specifications: { create: body.specifications || { material: "N/A", capacidade: "N/A", dimensoes: "N/A" } }
      },
      // ✅ CORREÇÃO CRÍTICA:
      // O 'include' garante que a resposta traz as relações necessárias (category, priceTable, etc.)
      // Isso impede que o frontend quebre ao tentar ler 'product.priceTable' logo após criar.
      include: {
        category: true,
        priceTable: true,
        specifications: true,
      }
    });

    // Retorna 201 Created
    return new NextResponse(JSON.stringify(product), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ error: "Erro interno ao criar produto" }, { status: 500 });
  }
}