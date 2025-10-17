// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

// Instanciar as dependências
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c"; // TODO: Substituir pelo ID do utilizador logado

// --- FUNÇÃO PUT (Atualizar) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const originalCategoryName = decodeURIComponent(params.name);
    const { newName } = await request.json();

    const updatedCategory = await categoryService.updateCategory(originalCategoryName, newName, MOCK_CATALOG_ID);

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}


// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const categoryName = decodeURIComponent(params.name);
    await categoryService.deleteCategory(categoryName, MOCK_CATALOG_ID);

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}