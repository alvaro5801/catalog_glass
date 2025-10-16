// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { categories } from "@/app/api/categories/data"; // ✅ Importa o array do módulo separado

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> } // ✅ Tipagem compatível com Next 15
) {
  const { name } = await context.params; // ✅ Necessário "await" no Next 15
  const categoryToDelete = decodeURIComponent(name);
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

  // Atualiza o array global (simulação de banco)
  categories.length = 0;
  categories.push(...updatedCategories);

  return NextResponse.json(categories, { status: 200 });
}

// --- FUNÇÃO PUT ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> } // ✅ Mesmo ajuste aqui
) {
  const { name } = await context.params;
  const originalCategory = decodeURIComponent(name);
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

  return NextResponse.json(categories, { status: 200 });
}
