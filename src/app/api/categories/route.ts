// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";

// --- SIMULAÇÃO DA BASE DE DADOS ---
// ✅ CORREÇÃO: Adicionamos 'export' para que a variável possa ser partilhada.
export let categories: string[] = ["Bebidas", "Comidas", "Sobremesas"];

// --- FUNÇÃO GET ---
export async function GET() {
  return NextResponse.json(categories);
}

// --- FUNÇÃO POST ---
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nome de categoria inválido." },
        { status: 400 }
      );
    }

    if (categories.includes(name)) {
      return NextResponse.json(
        { error: "Categoria já existente." },
        { status: 400 }
      );
    }

    // A reatribuição é segura porque estamos a usar 'let'
    categories = [...categories, name];
    return NextResponse.json(categories, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição." },
      { status: 500 }
    );
  }
}