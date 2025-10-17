// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// --- FUNÇÃO GET (Listar todas as categorias) ---
// ✅ CORREÇÃO: O parâmetro 'request' foi removido porque não estava a ser utilizado.
export async function GET() {
  try {
    const categories = await categoryService.getAllCategories(MOCK_CATALOG_ID);
    return NextResponse.json(categories);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar categorias.", details: err.message }, { status: 500 });
  }
}

// --- FUNÇÃO POST (Criar uma nova categoria) ---
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const newCategory = await categoryService.addNewCategory(name, MOCK_CATALOG_ID);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("caracteres") || err.message.includes("já existe")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao processar requisição.", details: err.message }, { status: 500 });
  }
}