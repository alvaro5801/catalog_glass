// src/app/api/categories/[name]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { categories } from '../route';

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest, // ✅ CORREÇÃO: Usar NextRequest em vez de Request
  context: { params: { name: string } } // ✅ CORREÇÃO: Usar a estrutura de 'context'
) {
  const categoryToDelete = decodeURIComponent(context.params.name); // Aceder via context.params
  const initialLength = categories.length;

  const updatedCategories = categories.filter(cat => cat !== categoryToDelete);

  if (updatedCategories.length === initialLength) {
    return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
  }

  // Limpa o array original e preenche com os novos dados para simular a atualização
  categories.length = 0;
  categories.push(...updatedCategories);

  return NextResponse.json(categories);
}

// --- FUNÇÃO PUT ---
export async function PUT(
  request: NextRequest, // ✅ CORREÇÃO: Usar NextRequest
  context: { params: { name: string } } // ✅ CORREÇÃO: Usar a estrutura de 'context'
) {
  const originalCategory = decodeURIComponent(context.params.name); // Aceder via context.params
  const { newName } = await request.json();

  if (!newName || (categories.includes(newName) && newName !== originalCategory)) {
    return NextResponse.json({ error: 'Novo nome inválido ou já existente.' }, { status: 400 });
  }

  const categoryIndex = categories.findIndex(cat => cat === originalCategory);

  if (categoryIndex === -1) {
    return NextResponse.json({ error: 'Categoria original não encontrada.' }, { status: 404 });
  }

  categories[categoryIndex] = newName;

  return NextResponse.json(categories);
}