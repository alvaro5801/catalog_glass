// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import Image from "next/image";
// Importar os tipos do Prisma que a API realmente retorna
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client";

// --- Tipos de Dados ---
type Category = Pick<PrismaCategory, 'id' | 'name'>;

type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
    category: Category | null; 
};

type ProductFormData = {
    name: string;
    categoryId: string;
    price: number;
    image: string;
};

// --- Componente: Formulário do Produto (no Modal) ---
function ProductForm({ product, categories, onSave, onCancel }: { 
    product: ProductWithRelations | null, 
    categories: Category[], 
    onSave: (data: ProductFormData, productId: string | null) => void, 
    onCancel: () => void 
}) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        categoryId: '',
        price: 0,
        image: '/images/placeholder.png',
    });

    useEffect(() => {
        // Correção (Lógica do Preço): Usar a mesma lógica da tabela
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
        onSave(formData, product?.id || null);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Nome do Produto</Label><Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                
                <div><Label htmlFor="category">Categoria</Label><Select value={formData.categoryId} onValueChange={value => setFormData({ ...formData, categoryId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
                
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

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

    const handleSaveProduct = async (formData: ProductFormData, productId: string | null) => {
        try {
            const isEditing = !!productId;
            const url = isEditing ? `/api/products/${productId}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const body = {
                name: formData.name,
                categoryId: formData.categoryId,
                // ... outros campos (slug, description, etc) que a API (service) espera
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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

    if (isLoading) return <p>A carregar dados do catálogo...</p>;

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
                            <TableHead>Imagem</TableHead><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço (a partir de)</TableHead><TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                        products.map(product => {
                            // ✅ --- CORREÇÃO DA LÓGICA DO PREÇO (Erro 1) ---
                            // 1. Extrair apenas os preços
                            const prices = product.priceTable.map(p => p.price);
                            // 2. Calcular o mínimo SÓ dos preços, ou usar 0 se não houver preços
                            const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            // --- FIM DA CORREÇÃO ---
                            
                            // Encontrar o nome da categoria
                            const categoryName = categories.find(c => c.id === product.categoryId)?.name || 'N/A';
                            
                            return (
                                <TableRow key={product.id}>
                                    <TableCell><Image src={product.images[0] || '/images/placeholder.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{categoryName}</TableCell>
                                    {/* Agora 'startingPrice' será 3.50 (corretamente) */}
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