// src/app/admin/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct } from "@prisma/client";

// Importar os auxiliares de segurança e o Prisma
import { getAuthenticatedUser, getUserCatalogId } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // ✅ IMPORTAR O PRISMA

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Verificar Sessão
  const user = await getAuthenticatedUser();
  
  if (!user || !user.email) {
    redirect("/");
  }

  // 2. Obter o ID do Catálogo
  const catalogId = await getUserCatalogId(user.email);
  
  // ✅ 3. NOVO: Buscar o SLUG do catálogo para criar o link correto
  const catalogData = await prisma.catalog.findUnique({
    where: { id: catalogId },
    select: { slug: true }
  });

  // Define o link da loja (ex: /minha-loja)
  const storeLink = catalogData?.slug ? `/${catalogData.slug}` : '/';

  // 4. Instanciar serviços e buscar dados
  const productRepository = new ProductRepository();
  const productService = new ProductService(productRepository);
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  const allProducts = await productService.getProducts(catalogId);
  const allCategories = await categoryService.getAllCategories(catalogId);

  const totalProducts = allProducts.length;
  const totalCategories = allCategories.length;
  const recentProducts = allProducts.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total de Produtos</h3>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total de Categorias</h3>
          <p className="text-3xl font-bold">{totalCategories}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Button size="lg" asChild>
          <Link href="/admin/products">
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Novo Produto
          </Link>
        </Button>
        {/* ✅ LINK CORRIGIDO AQUI */}
        <Button size="lg" variant="outline" asChild>
          <Link href={storeLink} target="_blank"> {/* Adicionei target="_blank" para abrir noutra aba */}
            Ver o meu Catálogo
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-xl font-semibold mb-4">Produtos Adicionados Recentemente</h3>
        {recentProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Ainda não tem produtos. Comece por adicionar um!</p>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Categoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentProducts.map((product: PrismaProduct) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.images[0] || '/images/placeholder.png'}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{allCategories.find(c => c.id === product.categoryId)?.name || 'Sem categoria'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  );
}