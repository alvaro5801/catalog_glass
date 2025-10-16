// src/app/api/products/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { products } from '@/data/products';
import type { Product } from '@/lib/types';

// --- FUNÇÃO GET ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Tipagem compatível com Next 15
) {
  const { id } = await context.params; // ✅ Necessário "await" no Next 15
  const productId = parseInt(id, 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(product);
}


// --- FUNÇÃO PUT ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Mesmo ajuste aqui
) {
  const { id } = await context.params;
  const productId = parseInt(id, 10);
  const productData: Partial<Omit<Product, 'id'>> = await request.json();

  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  products[productIndex] = { ...products[productIndex], ...productData };

  return NextResponse.json(products[productIndex]);
}

// --- FUNÇÃO DELETE ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ E aqui também
) {
  const { id } = await context.params;
  const productId = parseInt(id, 10);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  products.splice(productIndex, 1);

  return new Response(null, { status: 204 });
}