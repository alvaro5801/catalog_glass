// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import type { CreateProductData } from "@/domain/interfaces/IProductRepository";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

export async function GET() {
  try {
    const products = await productService.getProducts(MOCK_CATALOG_ID);
    return NextResponse.json(products);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar produtos.", details: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateProductData;
    const newProduct = await productService.createProduct(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("caracteres")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar produto.", details: err.message }, { status: 500 });
  }
}