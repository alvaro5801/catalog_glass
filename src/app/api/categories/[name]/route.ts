// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

export const dynamic = 'force-dynamic';

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

// ✅ PUT PROTEGIDO
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const catalogId = await getUserCatalogId(user.email);
    const { name } = await context.params;
    const originalCategoryName = decodeURIComponent(name);
    const { newName } = await request.json();

    // O Service já usa o catalogId para encontrar a categoria, 
    // o que garante implicitamente que só edita se pertencer ao user.
    await categoryService.updateCategory(originalCategoryName, newName, catalogId);

    const allCategories = await categoryService.getAllCategories(catalogId);
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// ✅ DELETE PROTEGIDO
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const catalogId = await getUserCatalogId(user.email);
    const { name } = await context.params;
    const categoryName = decodeURIComponent(name);
    
    await categoryService.deleteCategory(categoryName, catalogId);

    const allCategories = await categoryService.getAllCategories(catalogId);
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}