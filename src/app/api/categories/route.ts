// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
// ✅ Importar os auxiliares de segurança
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

// ID do catálogo de demonstração (Vitrine Pública)
const DEMO_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// GET: Retorna categorias do utilizador (se logado) ou da demo (se público)
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    let catalogId = DEMO_CATALOG_ID;

    // Se houver utilizador logado, tentamos buscar o catálogo dele
    if (user && user.email) {
        try {
            catalogId = await getUserCatalogId(user.email);
        } catch (error) {
            console.error("Erro ao obter catálogo do utilizador:", error);
            // Em caso de erro (ex: user sem catálogo), mantém o ID de demo ou trata conforme necessário
        }
    }

    const categories = await categoryService.getAllCategories(catalogId);
    return NextResponse.json(categories);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar categorias.", details: err.message }, { status: 500 });
  }
}

// ✅ POST PROTEGIDO: Cria categoria no catálogo do utilizador
export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Obter o Catálogo REAL do utilizador
    const catalogId = await getUserCatalogId(user.email);
    
    const { name } = await request.json();

    if (!name) {
        return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    // 3. Criar Categoria no catálogo correto
    const newCategory = await categoryService.addNewCategory(name, catalogId);
    return NextResponse.json(newCategory, { status: 201 });
    
  } catch (error) {
    const err = error as Error;
    // Tratamento de erros de validação (ex: duplicado ou nome curto)
    if (err.message.includes("caracteres") || err.message.includes("existe")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar categoria.", details: err.message }, { status: 500 });
  }
}