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
  _request: NextRequest,
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

// ✅ PUT PROTEGIDO (CORRIGIDO)
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

    // 2. Verificar Propriedade
    const existingProduct = await productService.getProductById(id);
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    
    if (existingProduct.catalogId !== catalogId) {
        return NextResponse.json({ error: "Acesso proibido a este produto." }, { status: 403 });
    }

    // 3. Ler e Limpar os Dados (O Segredo da Correção 🛠️)
    const body = await request.json();

    // Removemos campos que não existem na tabela Product ou que precisam de tratamento especial
    // 'price', 'specifications' e 'priceTable' são tratados separadamente abaixo.
    // 'id' e 'category' (nome) também removemos para não tentar sobrescrever chaves primárias ou campos virtuais.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { price, specifications, priceTable, id: _bodyId, category, ...otherFields } = body;

    // 4. Construir o objeto de atualização no formato que o Prisma aceita
    const updateData = {
        ...otherFields,
        
        // Atualizamos o priceInfo (string) para manter consistência visual
        priceInfo: String(price),

        // Atualizar Especificações (Relação 1 para 1)
        specifications: {
            upsert: {
                create: specifications,
                update: specifications
            }
        },

        // Atualizar Tabela de Preços (Relação 1 para N)
        // Estratégia Simples: Apagar os preços antigos e criar o novo
        // Isso resolve o problema de IDs perdidos ou lógica complexa de atualização
        priceTable: {
            deleteMany: {}, // Remove todos os preços antigos deste produto
            create: [{ quantity: '1', price: Number(price) }] // Adiciona o novo preço
        }
    };

    // 5. Executar a atualização
    const updatedProduct = await productService.updateProduct(id, updateData);
    
    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("Erro no PUT:", error); // Log para ajudar no debug
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE PROTEGIDO
export async function DELETE(
  _request: NextRequest,
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