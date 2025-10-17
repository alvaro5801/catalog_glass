// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";

// ✅ 1. Instanciar as nossas camadas de domínio e serviço
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

// TODO: Este ID deverá vir da sessão do utilizador autenticado no futuro
const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// --- FUNÇÃO GET (Listar todas as categorias) ---
export async function GET(request: NextRequest) {
  try {
    // ✅ 2. Chamar o serviço para obter os dados reais
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

    // ✅ 3. Usar o serviço para criar a nova categoria (a lógica de negócio fica no serviço)
    const newCategory = await categoryService.addNewCategory(name, MOCK_CATALOG_ID);

    // Retorna a categoria criada com o status 201 (Created)
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    const err = error as Error;
    // Se for um erro de validação ou de categoria duplicada, retorna 400
    if (err.message.includes("caracteres") || err.message.includes("já existe")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    // Para outros erros, retorna 500
    return NextResponse.json({ error: "Erro ao processar requisição.", details: err.message }, { status: 500 });
  }
}