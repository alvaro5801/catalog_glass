// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { categories } from "../route"; // Esta linha agora funciona perfeitamente

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest,
  context: { params: { name: string } }
) {
  const categoryToDelete = decodeURIComponent(context.params.name);
  const initialLength = categories.length;

  const updatedCategories = categories.filter(
    (cat: string) => cat !== categoryToDelete
  );

  if (updatedCategories.length === initialLength) {
    return NextResponse.json(
      { error: "Categoria não encontrada." },
      { status: 404 }
    );
  }

  categories.length = 0;
  categories.push(...updatedCategories);

  return NextResponse.json(categories);
}

// --- FUNÇÃO PUT ---
export async function PUT(
  request: NextRequest,
  context: { params: { name: string } }
) {
  const originalCategory = decodeURIComponent(context.params.name);
  const { newName } = await request.json();

  if (!newName || (categories.includes(newName) && newName !== originalCategory)) {
    return NextResponse.json(
      { error: "Novo nome inválido ou já existente." },
      { status: 400 }
    );
  }

  const categoryIndex = categories.findIndex(
    (cat: string) => cat === originalCategory
  );

  if (categoryIndex === -1) {
    return NextResponse.json(
      { error: "Categoria original não encontrada." },
      { status: 404 }
    );
  }

  categories[categoryIndex] = newName;

  return NextResponse.json(categories);
}