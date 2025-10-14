// src/app/(app)/configure/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

// --- Tipos de Dados ---
type Category = string;
type Product = {
    id: number;
    name: string;
    category: Category;
    price: number;
    image: string; // URL da imagem (simulado)
};

// --- Componente: Gestão de Produtos ---
function ProductManagement({ categories }: { categories: Category[] }) {
    const [products, setProducts] = useState<Product[]>([
        { id: 1, name: "Copo Long Drink", category: "Bebidas", price: 4.50, image: "/images/products/long-drink-1.jpg" },
        { id: 2, name: "Taça de Gin Metalizada", category: "Bebidas", price: 12.00, image: "/images/products/taca-gin-1.jpg" }
    ]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const handleDeleteProduct = (productId: number) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productData } : p));
        } else {
            const newProduct = { id: Date.now(), ...productData };
            setProducts([...products, newProduct]);
        }
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="p-6 border bg-background rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Seus Produtos</h3>
                    <Button onClick={handleAddNewClick} asChild>
                        <DialogTrigger><PlusCircle className="mr-2 h-4 w-4" />Adicionar Produto</DialogTrigger>
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                <TableCell><Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(product)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {isDialogOpen && <ProductFormDialog product={editingProduct} categories={categories} onSave={handleSaveProduct} />}
        </Dialog>
    );
}

// --- Componente: Formulário do Produto (no Modal) ---
function ProductFormDialog({ product, categories, onSave }: { product: Product | null, categories: Category[], onSave: (data: Omit<Product, 'id'>) => void }) {
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
                <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div><Label>Imagem (funcionalidade de upload a ser implementada)</Label></div>
                <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
        </DialogContent>
    );
}

// --- Componente: Gestão de Categorias ---
function CategoryManagement({ categories, setCategories }: { categories: Category[], setCategories: React.Dispatch<React.SetStateAction<Category[]>> }) {
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories(prev => [...prev, newCategory]);
            setNewCategory("");
        }
    };

    const handleDeleteCategory = (categoryToDelete: string) => {
        setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
    };

    const handleEditStart = (categoryToEdit: string) => {
        setEditingCategory(categoryToEdit);
        setEditingText(categoryToEdit);
    };
    
    const handleEditSave = (originalCategory: string) => {
        setCategories(prev => prev.map(cat => cat === originalCategory ? editingText : cat));
        setEditingCategory(null);
    };

    return (
        <div className="p-6 border bg-background rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h3>
            <div className="flex gap-2 mb-8">
                <Input placeholder="Nome da categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <Button onClick={handleAddCategory}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>
            </div>
            <h3 className="text-xl font-semibold mb-4 border-t pt-6">Categorias Existentes</h3>
            <div className="space-y-2">
                {categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between rounded-md bg-muted p-3">
                        {editingCategory === cat ? (
                            <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} className="mr-2" />
                        ) : (
                            <span>{cat}</span>
                        )}
                        <div className="flex items-center gap-2">
                            {editingCategory === cat ? (
                                <Button size="sm" onClick={() => handleEditSave(cat)}>Guardar</Button>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEditStart(cat)}><Edit className="h-4 w-4" /></Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Componente Principal da Página ---
export default function ConfigurePage() {
    const [categories, setCategories] = useState<Category[]>(["Bebidas", "Comidas", "Sobremesas"]);

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Configuração do Catálogo</h1>
            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">Produtos</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <ProductManagement categories={categories} />
                </TabsContent>
                <TabsContent value="categories">
                    <CategoryManagement categories={categories} setCategories={setCategories} />
                </TabsContent>
            </Tabs>
        </div>
    );
}