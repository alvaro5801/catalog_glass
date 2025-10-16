// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, Star } from "lucide-react";
import Image from "next/image";
import type { Product as ProductType } from "@/lib/types";

type Category = string;
// ✅ CORREÇÃO: Definimos um tipo para os dados do formulário em vez de usar 'any'.
type ProductFormData = { name: string; category: string; price: number; image: string };

// --- Componente: Formulário do Produto (no Modal) ---
function ProductForm({ product, categories, onSave, onCancel }: { product: ProductType | null, categories: Category[], onSave: (data: ProductFormData) => void, onCancel: () => void }) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        category: '',
        price: 0,
        image: '/images/placeholder.png',
    });

    useEffect(() => {
        setFormData({
            name: product?.name || "",
            category: product?.category || categories[0] || "",
            price: product?.priceTable[0]?.price || 0,
            image: product?.images[0] || "/images/placeholder.png",
        });
    }, [product, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                <DialogDescription>
                    {product ? "Altere as informações abaixo para atualizar o produto." : "Preencha as informações abaixo para criar um novo produto."}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Nome do Produto</Label><Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><Label htmlFor="category">Categoria</Label><Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
                <div><Label htmlFor="price">Preço</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required /></div>
                <div><Label>Imagem (funcionalidade de upload a ser implementada)</Label></div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit">Salvar</Button></div>
            </form>
        </DialogContent>
    );
}

// --- Componente Principal da Página de Produtos ---
export default function ProductsPage() {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories'),
                ]);
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

    const handleToggleFeatured = async (productId: number, currentStatus: boolean) => {
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? { ...p, isFeatured: !currentStatus } : p
            )
        );
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFeatured: !currentStatus }),
            });
        } catch (error) {
            console.error("Erro ao marcar como destaque:", error);
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === productId ? { ...p, isFeatured: currentStatus } : p
                )
            );
        }
    };

    const handleEditClick = (product: ProductType) => { setEditingProduct(product); setIsDialogOpen(true); };
    const handleAddNewClick = () => { setEditingProduct(null); setIsDialogOpen(true); };

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm("Tem a certeza que quer apagar este produto?")) return;
        try {
            await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Falha ao apagar produto:", error);
        }
    };

    const handleSaveProduct = async (formData: ProductFormData) => {
        try {
            const isEditing = !!editingProduct;
            const productPayload = {
                ...(editingProduct || {}),
                name: formData.name,
                category: formData.category,
                images: [formData.image || '/images/placeholder.png'],
                priceTable: [{ quantity: '1 unidade', price: formData.price || 0 }],
                ...(!isEditing && {
                    slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                    shortDescription: 'Descrição curta a ser preenchida.',
                    description: 'Descrição completa a ser preenchida.',
                    specifications: { material: 'N/A', capacidade: 'N/A', dimensoes: 'N/A' },
                    priceInfo: 'Informação de preço a ser preenchida.'
                })
            };
            const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload),
            });

            if (!response.ok) throw new Error('Falha ao salvar produto');
            const savedProduct = await response.json();

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
                            <TableHead className="w-[60px]">Destaque</TableHead>
                            <TableHead>Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(product.id, !!product.isFeatured)} aria-label={product.isFeatured ? `Remover ${product.name} dos destaques` : `Adicionar ${product.name} aos destaques`}>
                                        <Star className={`h-5 w-5 transition-colors ${product.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
                                    </Button>
                                </TableCell>
                                <TableCell><Image src={product.images?.[0] || '/images/placeholder.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>R$ {product.priceTable?.[0]?.price.toFixed(2).replace('.', ',') || '0,00'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(product)} className="mr-2" aria-label={`Editar ${product.name}`}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)} aria-label={`Apagar ${product.name}`}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {isDialogOpen && <ProductForm product={editingProduct} categories={categories} onSave={handleSaveProduct} onCancel={() => setIsDialogOpen(false)} />}
        </Dialog>
    );
}