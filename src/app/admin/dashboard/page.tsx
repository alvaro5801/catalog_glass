// src/app/admin/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ✅ 1. Importar os nossos serviços e tipos do Prisma
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct } from '@prisma/client';

// ✅ 2. A página agora é um Server Component (async)
export default async function DashboardPage() {
  // Instanciar os serviços
  const productRepository = new ProductRepository();
  const productService = new ProductService(productRepository);
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  // TODO: Obter o ID do catálogo do utilizador correto
  const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

  // ✅ 3. Buscar os dados reais da base de dados
  const allProducts = await productService.getProducts(MOCK_CATALOG_ID);
  const allCategories = await categoryService.getAllCategories(MOCK_CATALOG_ID);

  // Calcular os totais e produtos recentes
  const totalProducts = allProducts.length;
  const totalCategories = allCategories.length;
  const recentProducts = allProducts.slice(0, 4); // Por agora, pegar os 4 mais recentes da lista

  return (
    <div className="space-y-6">
      {/* Secção de Visão Geral (Cards) */}
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

      {/* Secção de Ações Rápidas (Botões) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button size="lg" asChild>
          <Link href="/admin/products">
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Novo Produto
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/">
            Ver o meu Catálogo
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* ✅ 4. Secção de Produtos Recentes atualizada */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-xl font-semibold mb-4">Produtos Adicionados Recentemente</h3>
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
                    src={product.images[0] || '/images/placeholder.png'} // Adicionar uma imagem de fallback
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                {/* O produto do Prisma tem 'categoryId'. Precisamos de encontrar o nome da categoria. */}
                <TableCell>{allCategories.find(c => c.id === product.categoryId)?.name || 'Sem categoria'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}