// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';

// --- SIMULAÇÃO DA BASE DE DADOS ---
// ✅ CORREÇÃO: Alterado de 'let' para 'const'.
export const categories: string[] = ["Bebidas", "Comidas", "Sobremesas"];

// --- FUNÇÃO GET ---
export async function GET() {
  return NextResponse.json(categories);
}

// --- FUNÇÃO POST ---
export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name || categories.includes(name)) {
    return NextResponse.json({ error: 'Nome inválido ou já existente.' }, { status: 400 });
  }

  categories.push(name);
  return NextResponse.json(categories);
}