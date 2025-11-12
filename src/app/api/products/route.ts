// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import type { CreateProductData } from "@/domain/interfaces/IProductRepository";
// ✅ 1. Importar os novos auxiliares de segurança
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

// ID do catálogo de demonstração (Vitrine Pública para visitantes)
const DEMO_CATALOG_ID = "clxrz8hax00003b6khe69046c";

// ✅ GET ATUALIZADO: Suporta Multi-tenancy (User vs Demo)
export async function GET(_request: NextRequest) {
  try {
    // 1. Tentar identificar o utilizador
    const user = await getAuthenticatedUser();
    
    let catalogId = DEMO_CATALOG_ID;

    // 2. Se estiver logado, usamos o catálogo dele
    if (user && user.email) {
        try {
            catalogId = await getUserCatalogId(user.email);
        } catch (error) {
            console.error("Erro ao recuperar catálogo do user, usando demo:", error);
            // Mantém o DEMO_CATALOG_ID em caso de erro (ex: user sem catálogo)
        }
    }

    // 3. Buscar produtos (do catálogo definido acima)
    const products = await productService.getProducts(catalogId);
    return NextResponse.json(products);

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar produtos.", details: err.message }, { status: 500 });
  }
}

// ✅ POST PROTEGIDO: Cria produtos apenas no catálogo do utilizador
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar Autenticação
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado. Por favor faça login." }, { status: 401 });
    }

    // 2. Obter o Catálogo REAL do Utilizador
    const catalogId = await getUserCatalogId(user.email);

    const body = await request.json();
    
    // 3. Construir os dados do produto de forma segura
    // Forçamos a ligação ('connect') ao catálogo do utilizador.
    const productData: CreateProductData = {
      ...body,
      catalog: { connect: { id: catalogId } } 
    };

    // 4. Tratamento especial para a categoria (Prisma relation)
    if (body.categoryId) {
       productData.category = { connect: { id: body.categoryId } };
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       delete (productData as any).categoryId; 
    }

    // 5. Criar o produto
    const newProduct = await productService.createProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    const err = error as Error;
    // Tratamento de erros de validação
    if (err.message.includes("caracteres")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar produto.", details: err.message }, { status: 500 });
  }
}