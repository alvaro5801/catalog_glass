// src/app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/(auth)/[...nextauth]/route"; // 1. Importar as nossas authOptions

// Função para gerar um 'slug' simples
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, ''); // Remove caracteres não-alfanuméricos
}

export async function POST(request: Request) {
  try {
    // 2. Proteger a Rota: Obter a sessão do utilizador
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 3. Obter os dados do frontend
    const body = await request.json();
    const { businessName, categories, product } = body;

    // 4. Usar uma Transação do Prisma
    // Isto garante que todas as operações são executadas como uma única unidade.
    // Se algo falhar (ex: falha ao criar o produto), tudo é revertido.
    const result = await prisma.$transaction(async (tx) => {

      // 1. Criar o Catálogo principal, ligado ao Utilizador
      const newCatalog = await tx.catalog.create({
        data: {
          userId: userId,
          // Vamos usar o businessName como o nome do catálogo por agora
          // No futuro, podemos adicionar um campo "catalogName" ao wizard
        },
      });
      const catalogId = newCatalog.id;

      // 2. Criar as Categorias, ligadas ao Catálogo
      const createdCategories = await tx.category.createMany({
        data: categories.map((catName: string) => ({
          name: catName,
          catalogId: catalogId,
        })),
        skipDuplicates: true,
      });

      // Precisamos dos IDs das categorias que acabámos de criar para ligar ao produto
      const firstCategory = await tx.category.findFirst({
        where: { catalogId: catalogId },
      });

      if (!firstCategory) {
        throw new Error("Falha ao criar a categoria de exemplo.");
      }

      // 3. Criar o Produto de exemplo, ligado ao Catálogo e à primeira Categoria
      const productPrice = parseFloat(product.price) || 0;
      await tx.product.create({
        data: {
          name: product.name || "Produto de Exemplo",
          slug: generateSlug(product.name || "Produto de Exemplo"),
          shortDescription: "Este é o seu primeiro produto, edite-o!",
          description: "Descrição completa do seu produto de exemplo.",
          images: ["/images/placeholder.png"], // Imagem de placeholder
          priceInfo: "Preço por unidade",
          catalogId: catalogId,
          categoryId: firstCategory.id,
          // Criar relações de especificações e preço
          specifications: {
            create: {
              material: "N/A",
              capacidade: "N/A",
              dimensoes: "N/A",
            },
          },
          priceTable: {
            create: [
              { quantity: "1-10", price: productPrice },
            ],
          },
        },
      });

      // 4. Marcar o Utilizador como "onboarding completo"
      await tx.user.update({
        where: { id: userId },
        data: { onboardingComplete: true },
      });

      return newCatalog;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Falha no onboarding:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao processar o onboarding." }, { status: 500 });
  }
}