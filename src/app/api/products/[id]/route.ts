// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

export const dynamic = 'force-dynamic';

// --- FUNÇÃO GET (Obter um produto por ID) ---
export async function GET(
  request: NextRequest,
  // ✅ CORREÇÃO: Mudar a assinatura para o que o build espera
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ CORREÇÃO: Usar 'await' para extrair os params
    const { id } = await context.params;
    
    const product = await productService.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// --- FUNÇÃO PUT (Atualizar um produto) ---
export async function PUT(
  request: NextRequest,
  // ✅ CORREÇÃO: Mudar a assinatura para o que o build espera
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ CORREÇÃO: Usar 'await' para extrair os params
    const { id } = await context.params;
    
    const body = await request.json();
    const updatedProduct = await productService.updateProduct(id, body);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// --- FUNÇÃO DELETE (Apagar um produto) ---
export async function DELETE(
  request: NextRequest,
  // ✅ CORREÇÃO: Mudar a assinatura para o que o build espera
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ CORREÇÃO: Usar 'await' para extrair os params
    const { id } = await context.params;
    
    await productService.deleteProduct(id);
    return new NextResponse(null, { status: 204 }); // Sucesso, sem conteúdo
  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrado") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}