// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

// ✅ CORREÇÃO: Adicionamos esta linha para forçar a rota a ser dinâmica.
// Isto resolve a confusão de tipos que o Next.js pode ter durante a compilação.
export const dynamic = 'force-dynamic';

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

    // A tua lógica aqui estava correta. O erro não era nela.
    const updatedCategory = await categoryService.updateCategory(originalCategoryName, newName, MOCK_CATALOG_ID);

    // O retorno da API para PUT geralmente é o objeto atualizado ou um status de sucesso.
    // Vamos retornar a lista completa de categorias após a atualização,
    // para que o frontend possa atualizar o estado facilmente.
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
  { params }: { params: { name: string } }
) {
  try {
    const categoryName = decodeURIComponent(params.name);
    await categoryService.deleteCategory(categoryName, MOCK_CATALOG_ID);

    // Assim como no PUT, vamos retornar a lista atualizada para o frontend.
    const allCategories = await categoryService.getAllCategories(MOCK_CATALOG_ID);
    return NextResponse.json(allCategories, { status: 200 });

  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}