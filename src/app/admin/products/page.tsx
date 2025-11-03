// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ✅ (Merge) Importações da 'main' (DialogDescription, Star, Loader2)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, Star, Loader2 } from "lucide-react";
import Image from "next/image";
// Importar os tipos do Prisma que a API realmente retorna
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client";

// --- Tipos de Dados ---

// ✅ (Merge) Usámos o tipo da 'main' (PrismaCategory) que é mais direto
type Category = PrismaCategory;

// ✅ (Merge) Usámos o tipo da 'feature/test' que inclui a relação 'category'
// necessária para exibir o nome da categoria na tabela.
type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
    category: Pick<PrismaCategory, 'id' | 'name'> | null; // A tabela precisa do nome
};

type ProductFormData = {
    name: string;
    categoryId: string;
    price: number; // Este preço é o "inicial" para o Math.min
    image: string;
};

// --- Componente: Formulário do Produto (no Modal) ---
function ProductForm({ product, categories, onSave, onCancel }: { 
    product: ProductWithRelations | null, 
    categories: Category[], 
    // ✅ (Merge) Usámos o onSave da 'main', que é mais simples e correto
    onSave: (data: ProductFormData) => void, 
    onCancel: () => void 
}) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        categoryId: '',
        price: 0,
        image: '/images/placeholder.png',
    });

    useEffect(() => {
        // ✅ (Merge) Lógica de preço correta da 'feature/test' (Math.min)
        const prices = product?.priceTable.map(p => p.price) || [];
        const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
        
        setFormData({
            name: product?.name || "",
            categoryId: product?.categoryId || categories[0]?.id || "",
            price: startingPrice, // Usar o preço inicial calculado
            image: product?.images[0] || "/images/placeholder.png",
        });
    }, [product, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ✅ (Merge) Chamada onSave da 'main'
        onSave(formData);
    };

    return (
        // ✅ (Merge) JSX do Modal da 'main' (com DialogDescription)
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                <DialogDescription>
                    {product ? "Altere as informações para atualizar o produto." : "Preencha as informações para criar um novo produto."}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Nome do Produto</Label><Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                
                <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.categoryId} onValueChange={value => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                
                {/* ✅ (Merge) Usámos o Label da 'feature/test' (Preço (Inicial)) que corresponde à lógica Math.min */}
                <div><Label htmlFor="price">Preço (Inicial)</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required /></div>
                
                <div><Label>Imagem (funcionalidade de upload a ser implementada)</Label></div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit">Salvar</Button></div>
            </form>
        </DialogContent>
    );
}

// --- Componente Principal da Página de Produtos ---
export default function ProductsPage() {
    const [products, setProducts] = useState<ProductWithRelations[]>([]);
    // ✅ (Merge) Usámos o tipo da 'main' para o estado
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

    // Efeito para buscar dados (igual em ambas, está correto)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories'),
                ]);

                if (!productsRes.ok || !categoriesRes.ok) {
                    throw new Error('Falha ao carregar dados da API');
                }

                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();
                
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Falha ao buscar dados:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ✅ (Merge) Adicionámos a função 'handleToggleFeatured' da 'main'
    const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
        // Atualização Otimista: Mudar o estado na UI imediatamente
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? { ...p, isFeatured: !currentStatus } : p
            )
        );
        // Tentar atualizar no backend
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFeatured: !currentStatus }),
            });
        } catch (error) {
            console.error("Erro ao marcar como destaque:", error);
            // Reverter a mudança na UI em caso de erro
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === productId ? { ...p, isFeatured: currentStatus } : p
                )
            );
        }
    };

    const handleEditClick = (product: ProductWithRelations) => { setEditingProduct(product); setIsDialogOpen(true); };
    const handleAddNewClick = () => { setEditingProduct(null); setIsDialogOpen(true); };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Tem a certeza que quer apagar este produto?")) return;
        try {
            await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Falha ao apagar produto:", error);
        }
    };

    // ✅ (Merge) Usámos o 'handleSaveProduct' completo da 'main'
    const handleSaveProduct = async (formData: ProductFormData) => {
        try {
            const isEditing = !!editingProduct;
            // Construir o payload para a API
            const productPayload = {
                ...(isEditing && { id: editingProduct.id }), // Incluir ID apenas na edição
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                categoryId: formData.categoryId,
                images: [formData.image],
                // Dados que ainda não estão no formulário, mas são necessários
                shortDescription: editingProduct?.shortDescription || 'Descrição curta a ser preenchida.',
                description: editingProduct?.description || 'Descrição completa a ser preenchida.',
                priceInfo: editingProduct?.priceInfo || 'Informação de preço a ser preenchida.',
                specifications: {
                    create: editingProduct?.specifications || { material: 'N/A', capacidade: 'N/A', dimensoes: 'N/A' }
                },
                priceTable: {
                    // ✅ (Merge) Corrigimos a lógica de 'create' da 'main'
                    // Se estiver a editar, não cria, se for novo, usa o preço do formulário
                    ...(isEditing ? {} : {
                        create: [{ quantity: '1 unidade', price: formData.price }]
                    })
                },
            };

            const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload),
            });

            if (!response.ok) throw new Error('Falha ao salvar produto');
            
            const savedProduct: ProductWithRelations = await response.json(); 

            if (isEditing) {
                setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
            } else {
                setProducts(prev => [...prev, savedProduct]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    };

    // ✅ (Merge) Usámos o ecrã de loading da 'main'
    if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">A carregar dados do catálogo...</p></div>;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Gestão de Produtos</h2>
                <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Produto</Button>
            </div>
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* ✅ (Merge) Cabeçalho da 'main' (com Destaque) */}
                            <TableHead className="w-[80px]">Destaque</TableHead>
                            <TableHead>Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            {/* ✅ (Merge) Texto do cabeçalho da 'feature/test' */}
                            <TableHead>Preço (a partir de)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                        products.map(product => {
                            // ✅ (Merge) Lógica de preço correta da 'feature/test'
                            const prices = product.priceTable.map(p => p.price);
                            const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            
                            // A lógica de encontrar o nome da categoria está correta
                            const categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || 'N/A';
                            
                            return (
                                <TableRow key={product.id}>
                                    {/* ✅ (Merge) Célula "Destaque" da 'main' */}
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(product.id, !!product.isFeatured)} aria-label={product.isFeatured ? `Remover ${product.name} dos destaques` : `Adicionar ${product.name} aos destaques`}>
                                            <Star className={`h-5 w-5 transition-colors ${product.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
                                        </Button>
                                    </TableCell>
                                    <TableCell><Image src={product.images[0] || '/images/placeholder.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{categoryName}</TableCell>
                                    
                                    {/* ✅ (Merge) Célula de Preço usando a lógica correta da 'feature/test' */}
                                    <TableCell>R$ {startingPrice.toFixed(2)}</TableCell>

                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleEditClick(product)} className="mr-2" aria-label={`Editar ${product.name}`}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)} aria-label={`Apagar ${product.name}`}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            {isDialogOpen && <ProductForm product={editingProduct} categories={categories} onSave={handleSaveProduct} onCancel={() => setIsDialogOpen(false)} />}
        </Dialog>
    );
}