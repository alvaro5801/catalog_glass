// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";
import { Prisma } from "@prisma/client"; // ✅ Importação necessária para os tipos de erro

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
  } catch (_error) {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// POST: Criar produto
export async function POST(request: Request) {
  try {
    // 1. Autenticação
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // 2. Validação
    if (!body.name || body.price === undefined || !body.categoryId) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const priceNumber = Number(body.price);
    if (isNaN(priceNumber)) {
        return NextResponse.json({ error: "O preço deve ser um número válido." }, { status: 400 });
    }

    const catalogId = await getUserCatalogId(user.email);

    // 3. Slug: Gera automaticamente se não vier no body
    let productSlug = body.slug;
    if (!productSlug) {
      const baseSlug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      productSlug = `${baseSlug}-${Date.now()}`;
    }

    // 4. Criação com Tratamento de Erro Específico
    try {
        const product = await prisma.product.create({
          data: {
            name: body.name,
            slug: productSlug,
            shortDescription: body.shortDescription || "",
            description: body.description || "",
            priceInfo: String(priceNumber),
            isFeatured: body.isFeatured || false,
            images: body.images || [],
            catalogId: catalogId,
            categoryId: body.categoryId,
            
            // Tabelas relacionadas
            priceTable: { create: [{ quantity: "1", price: priceNumber }] },
            specifications: { 
                create: body.specifications || { 
                    material: "N/A", 
                    capacidade: "N/A", 
                    dimensoes: "N/A" 
                } 
            }
          },
          include: {
            category: true,
            priceTable: true,
            specifications: true,
          }
        });

        return new NextResponse(JSON.stringify(product), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        // ✅ CORREÇÃO: Verificação de tipo segura para erros do Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Erro PRISMA conhecido:", error.code, error.message);
            if (error.code === 'P2002') {
                 return NextResponse.json({ error: "Já existe um produto com este identificador." }, { status: 409 });
            }
        }
        throw error; // Relança para o catch genérico se não for tratado acima
    }

  } catch (error) { // ✅ CORREÇÃO: Removido ': any'
    console.error("Erro GENÉRICO ao criar produto:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno desconhecido";
    return NextResponse.json({ error: `Erro ao criar produto: ${errorMessage}` }, { status: 500 });
  }
}