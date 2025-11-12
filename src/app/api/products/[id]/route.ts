// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

export const dynamic = 'force-dynamic';

// GET: Público (para a vitrine)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

// ✅ PUT PROTEGIDO
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Check
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await context.params;
    const catalogId = await getUserCatalogId(user.email);

    // 2. Verificar Propriedade (O produto pertence ao catálogo do user?)
    const existingProduct = await productService.getProductById(id);
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    
    if (existingProduct.catalogId !== catalogId) {
        return NextResponse.json({ error: "Acesso proibido a este produto." }, { status: 403 });
    }

    const body = await request.json();
    const updatedProduct = await productService.updateProduct(id, body);
    return NextResponse.json(updatedProduct);

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE PROTEGIDO
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Check
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await context.params;
    const catalogId = await getUserCatalogId(user.email);

    // 2. Verificar Propriedade
    const existingProduct = await productService.getProductById(id);
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    if (existingProduct.catalogId !== catalogId) {
        return NextResponse.json({ error: "Acesso proibido a este produto." }, { status: 403 });
    }
    
    await productService.deleteProduct(id);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}