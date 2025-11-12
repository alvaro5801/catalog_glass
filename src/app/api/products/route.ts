// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import type { CreateProductData } from "@/domain/interfaces/IProductRepository";
// ✅ 1. Importar os novos auxiliares de segurança (que criámos no passo anterior)
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

// GET: Mantemos público para a vitrine, mas usamos um ID fixo por enquanto.
// (No futuro, isto pode ser dinâmico baseado no subdomínio/URL)
export async function GET(request: NextRequest) {
  try {
    const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c"; 
    const products = await productService.getProducts(MOCK_CATALOG_ID);
    return NextResponse.json(products);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Erro ao buscar produtos.", details: err.message }, { status: 500 });
  }
}

// ✅ POST: Agora totalmente protegido
export async function POST(request: NextRequest) {
  try {
    // 2. Verificar Autenticação
    // Se não houver sessão válida, rejeita imediatamente.
    const user = await getAuthenticatedUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado. Por favor faça login." }, { status: 401 });
    }

    // 3. Obter o Catálogo REAL do Utilizador
    // Isto garante que o produto vai para a "loja" certa.
    const catalogId = await getUserCatalogId(user.email);

    const body = await request.json();
    
    // 4. Construir os dados do produto de forma segura
    // Forçamos a ligação ('connect') ao catálogo que acabámos de recuperar da BD.
    const productData: CreateProductData = {
      ...body,
      catalog: { connect: { id: catalogId } } 
    };

    // 5. Tratamento especial para a categoria
    // Se o frontend enviar 'categoryId' (string), convertemos para a sintaxe do Prisma (connect)
    // e removemos o campo original para evitar erros de tipagem.
    if (body.categoryId) {
       productData.category = { connect: { id: body.categoryId } };
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       delete (productData as any).categoryId; 
    }

    // 6. Criar o produto
    const newProduct = await productService.createProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    const err = error as Error;
    // Tratamento de erros de validação (ex: nome muito curto)
    if (err.message.includes("caracteres")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar produto.", details: err.message }, { status: 500 });
  }
}