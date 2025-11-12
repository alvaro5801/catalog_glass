// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

// GET: Pode ser público se necessário, mas para admin é melhor filtrar
export async function GET() {
  try {
    // Se estiver logado, vê as suas. Se não, vê as do Mock (Vitrine)
    const user = await getAuthenticatedUser();
    let catalogId = "clxrz8hax00003b6khe69046c"; // Default Mock

    if (user && user.email) {
        catalogId = await getUserCatalogId(user.email);
    }

    const categories = await categoryService.getAllCategories(catalogId);
    return NextResponse.json(categories);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar categorias.", details: err.message }, { status: 500 });
  }
}

// ✅ POST PROTEGIDO
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const catalogId = await getUserCatalogId(user.email);
    const { name } = await request.json();

    if (!name) return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });

    const newCategory = await categoryService.addNewCategory(name, catalogId);
    return NextResponse.json(newCategory, { status: 201 });
    
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("caracteres") || err.message.includes("existe")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar categoria.", details: err.message }, { status: 500 });
  }
}