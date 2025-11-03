// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";

// Instanciar as dependências, tal como fizemos nas outras rotas
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

// --- FUNÇÃO GET (Obter um produto por ID) ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProductById(params.id);
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    // A nossa camada de serviço já trata da lógica de encontrar e atualizar
    const updatedProduct = await productService.updateProduct(params.id, body);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    const err = error as Error;
    // Retornar um erro mais específico se o produto não for encontrado
    const status = err.message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// --- FUNÇÃO DELETE (Apagar um produto) ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await productService.deleteProduct(params.id);
    return new NextResponse(null, { status: 204 }); // Sucesso, sem conteúdo
  } catch (error) {
    const err = error as Error;
    const status = err.message.includes("não encontrado") ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}