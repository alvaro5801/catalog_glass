// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

export const dynamic = 'force-dynamic';

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// --- FUNÇÃO PUT (Atualizar) ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const originalCategoryName = decodeURIComponent(name);
    const { newName } = await request.json();

    // ✅ CORREÇÃO: Removida a variável 'updatedCategory'
    await categoryService.updateCategory(originalCategoryName, newName, MOCK_CATALOG_ID);

    const allCategories = await categoryService.getAllCategories(MOCK_CATALOG_ID);
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const categoryName = decodeURIComponent(name);
    
    await categoryService.deleteCategory(categoryName, MOCK_CATALOG_ID);

    const allCategories = await categoryService.getAllCategories(MOCK_CATALOG_ID);
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}