// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

// 1. Inicializar o Repositório e o Serviço
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

// 2. Definir um ID de catálogo (simulado, como nos produtos)
// TODO: Este ID deve vir da autenticação do utilizador no futuro
const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// --- FUNÇÃO GET ---
export async function GET() {
  try {
    // 3. Chamar o serviço para buscar as categorias
    const categories = await categoryService.getAllCategories(MOCK_CATALOG_ID);
    return NextResponse.json(categories);
  } catch (error) {
    // 4. Lidar com erros inesperados (como o teste espera)
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar categorias.", details: err.message }, { status: 500 });
  }
}

// --- FUNÇÃO POST ---
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    // 5. Chamar o serviço para criar a categoria
    const newCategory = await categoryService.addNewCategory(name, MOCK_CATALOG_ID);
    return NextResponse.json(newCategory, { status: 201 });
    
  } catch (error) {
    const err = error as Error;
    // 6. Lidar com erros de validação (como o teste espera)
    if (err.message.includes("caracteres") || err.message.includes("existe")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    // 7. Lidar com outros erros
    return NextResponse.json({ error: "Erro ao criar categoria.", details: err.message }, { status: 500 });
  }
}