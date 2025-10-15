// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { products } from '@/data/products'; // 1. MUDANÇA: Importar a lista de produtos real
import type { Product } from '@/lib/types'; // 2. MUDANÇA: Importar o tipo Product

// 3. MUDANÇA: A simulação da base de dados local foi removida.
//    Agora usamos a variável 'products' importada.

// --- FUNÇÃO GET (BÓNUS) ---
// Devolve um único produto pelo seu ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(product);
}


// --- FUNÇÃO PUT ---
// Atualiza um produto existente
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10);
  const productData: Partial<Omit<Product, 'id'>> = await request.json();

  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  // Atualiza o produto na lista importada
  products[productIndex] = { ...products[productIndex], ...productData };

  return NextResponse.json(products[productIndex]);
}

// --- FUNÇÃO DELETE ---
// Apaga um produto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  // Remove o produto da lista importada
  products.splice(productIndex, 1);

  return new Response(null, { status: 204 }); // Resposta de sucesso sem conteúdo
}