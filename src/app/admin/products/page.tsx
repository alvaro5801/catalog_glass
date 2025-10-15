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

// --- Tipos de Dados ---
type Category = string;
type Product = {
    id: number;
    name: string;
    category: Category;
    price: number;
    image: string;
};

// --- Componente: Formulário do Produto (no Modal) ---
function ProductForm({ product, categories, onSave, onCancel }: { product: Product | null, categories: Category[], onSave: (data: Omit<Product, 'id'>) => void, onCancel: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: 0,
        image: '/images/placeholder.png',
    });

    useEffect(() => {
        setFormData({
            name: product?.name || "",
            category: product?.category || categories[0] || "",
            price: product?.price || 0,
            image: product?.image || "/images/placeholder.png",
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
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    const handleEditClick = (product: Product) => { setEditingProduct(product); setIsDialogOpen(true); };
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

    const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
        try {
            const isEditing = !!editingProduct;
            const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
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
                            <TableHead>Imagem</TableHead><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell><Image src={product.image || '/images/placeholder.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    {/* ✅ CORREÇÃO DE ACESSIBILIDADE ABAIXO */}
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