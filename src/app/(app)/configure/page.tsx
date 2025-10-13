// src/app/(app)/configure/page.tsx
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

// Componente placeholder para a gestão de produtos
function ProductManagement() {
    return (
        <div className="p-6 border bg-background rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Seus Produtos</h3>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Produto
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">
                A tabela com todos os seus produtos aparecerá aqui.
            </p>
        </div>
    )
}

// Componente placeholder para a gestão de categorias
function CategoryManagement() {
    return (
        <div className="p-6 border bg-background rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Suas Categorias</h3>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Categoria
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">
                A lista de todas as suas categorias aparecerá aqui.
            </p>
        </div>
    )
}

export default function ConfigurePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Configuração do Catálogo</h1>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}