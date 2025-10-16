// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";

// --- SIMULAÇÃO DA BASE DE DADOS ---
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

    categories = [...categories, name];
    return NextResponse.json(categories, { status: 201 });
  } catch (_error) { // ✅ CORREÇÃO: Adicionamos um underscore para indicar que a variável 'error' não é usada.
    return NextResponse.json(
      { error: "Erro ao processar requisição." },
      { status: 500 }
    );
  }
}