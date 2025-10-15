// src/app/api/categories/[name]/route.ts
import { NextResponse } from 'next/server';
// 1. MUDANÇA: Importar a lista de categorias do nosso novo ficheiro de rota
import { categories } from '../route';

// A simulação local da base de dados foi removida.

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  const categoryToDelete = decodeURIComponent(params.name);
  const initialLength = categories.length;
  
  // 2. MUDANÇA: 'let' removido, agora modificamos a lista importada
  const updatedCategories = categories.filter(cat => cat !== categoryToDelete);

  if (updatedCategories.length === initialLength) {
    return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
  }

  // Atualiza a lista original (simulando a escrita na base de dados)
  categories.length = 0;
  categories.push(...updatedCategories);

  return NextResponse.json(categories);
}

// --- FUNÇÃO PUT ---
export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
    const originalCategory = decodeURIComponent(params.name);
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