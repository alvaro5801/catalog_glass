// src/app/admin/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  // Simulando dados dinâmicos
  const totalProducts = products.length;
  
  // ✅ --- CORREÇÃO AQUI ---
  // Trocámos [...new Set(...)] por Array.from(new Set(...))
  // para ser compatível com a configuração do TypeScript.
  const totalCategories = Array.from(new Set(products.map(p => p.category))).length;
  // --- FIM DA CORREÇÃO ---

  const recentProducts = products.slice(0, 4); // Pegar os 4 primeiros como "recentes"

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

      {/* Secção de Produtos Recentes (Tabela) */}
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
            {recentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}