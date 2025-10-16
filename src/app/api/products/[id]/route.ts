// src/app/api/products/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { products } from '@/data/products';
import type { Product } from '@/lib/types';

// --- FUNÇÃO GET ---
export async function GET(
  request: NextRequest, // ✅ CORREÇÃO: Usar NextRequest
  context: { params: { id: string } } // ✅ CORREÇÃO: Usar a estrutura de 'context'
) {
  const productId = parseInt(context.params.id, 10); // Aceder via context.params
  const product = products.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(product);
}


// --- FUNÇÃO PUT ---
export async function PUT(
  request: NextRequest, // ✅ CORREÇÃO: Usar NextRequest
  context: { params: { id: string } } // ✅ CORREÇÃO: Usar a estrutura de 'context'
) {
  const productId = parseInt(context.params.id, 10); // Aceder via context.params
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
  request: NextRequest, // ✅ CORREÇÃO: Usar NextRequest
  context: { params: { id: string } } // ✅ CORREÇÃO: Usar a estrutura de 'context'
) {
  const productId = parseInt(context.params.id, 10); // Aceder via context.params
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  products.splice(productIndex, 1);

  return new Response(null, { status: 204 });
}