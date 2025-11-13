// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, Star, Loader2, Image as ImageIcon } from "lucide-react"; // Removido UploadCloud não usado
import Image from "next/image";
import type { Product as PrismaProduct, Category as PrismaCategory, Specification, PriceTier } from "@prisma/client";
import { upload } from '@vercel/blob/client'; 

// --- Tipos de Dados ---

type Category = PrismaCategory;

type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
    category: Pick<PrismaCategory, 'id' | 'name'> | null;
};

type ProductFormData = {
    name: string;
    categoryId: string;
    price: string | number; 
    image: string;
};

// --- Componente: Formulário do Produto (no Modal) ---
function ProductForm({ product, categories, onSave, onCancel }: { 
    product: ProductWithRelations | null, 
    categories: Category[], 
    onSave: (data: ProductFormData) => void, 
    onCancel: () => void 
}) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        categoryId: '',
        price: '', 
        image: '', 
    });

    // Estados para o upload
    const [isUploading, setIsUploading] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const prices = product?.priceTable.map(p => p.price) || [];
        const startingPrice = prices.length > 0 ? Math.min(...prices) : "";
        
        setFormData({
            name: product?.name || "",
            categoryId: product?.categoryId || categories[0]?.id || "",
            price: startingPrice, 
            image: product?.images[0] || "",
        });
    }, [product, categories]);

    const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        setIsUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });

            setFormData(prev => ({ ...prev, image: newBlob.url }));
            
        } catch (error) {
            console.error("Erro no upload:", error);
            alert("Falha ao carregar a imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            image: formData.image.trim() === "" ? "/images/placeholder.png" : formData.image
        };
        onSave(dataToSave);
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                <DialogDescription>
                    Preencha as informações. Carregue uma imagem do seu computador.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Ex: Copo Long Drink" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={formData.categoryId} onValueChange={value => setFormData({ ...formData, categoryId: value })}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="price">Preço (Inicial)</Label>
                        <Input 
                            id="price" 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            value={formData.price} 
                            onChange={e => setFormData({ ...formData, price: e.target.value })} 
                            required 
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    {/* ✅ CORREÇÃO 1: htmlFor agora corresponde ao ID do input */}
                    <Label htmlFor="image-upload">Imagem do Produto</Label>
                    <div className="flex gap-4 items-center">
                        {/* Preview */}
                        <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden relative shrink-0">
                            {isUploading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : formData.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={formData.image} 
                                    alt="Preview" 
                                    className="h-full w-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                                />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                            )}
                        </div>

                        {/* Botão de Upload */}
                        <div className="flex-1">
                            <Input
                                ref={inputFileRef}
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleUploadFile}
                                disabled={isUploading}
                                className="cursor-pointer file:cursor-pointer file:text-primary hover:file:text-primary/80"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {isUploading ? "A enviar para a nuvem..." : "Formatos: JPG, PNG, WEBP (Max 4MB)"}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar
                    </Button>
                </div>
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

    const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
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

    const handleSaveProduct = async (formData: ProductFormData) => {
        try {
            if (!formData.name || !formData.price || !formData.categoryId) {
                alert("Por favor, preencha o nome, o preço e selecione uma categoria.");
                return;
            }

            const isEditing = !!editingProduct;
            const finalPrice = formData.price === "" ? 0 : Number(formData.price);

            const productPayload = {
                ...(isEditing && { id: editingProduct.id }), 
                name: formData.name,
                price: finalPrice,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                categoryId: formData.categoryId,
                images: [formData.image],
                
                shortDescription: editingProduct?.shortDescription || 'Descrição curta.',
                description: editingProduct?.description || 'Descrição completa.',
                priceInfo: editingProduct?.priceInfo || 'Unidade',
                
                specifications: editingProduct?.specifications ? {
                    material: editingProduct.specifications.material,
                    capacidade: editingProduct.specifications.capacidade,
                    dimensoes: editingProduct.specifications.dimensoes
                } : { 
                    material: 'N/A', 
                    capacidade: 'N/A', 
                    dimensoes: 'N/A' 
                },
                
                priceTable: [] 
            };

            const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao salvar produto');
            }
            
            const savedProduct: ProductWithRelations = data; 

            if (isEditing) {
                setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
            } else {
                setProducts(prev => [savedProduct, ...prev]);
            }
            setIsDialogOpen(false);

        } catch (error) {
            console.error("Erro no frontend:", error);
            alert(error instanceof Error ? error.message : "Erro ao salvar produto.");
        }
    };

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
                            <TableHead className="w-[80px]">Destaque</TableHead>
                            <TableHead>Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço (a partir de)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                        products.map(product => {
                            const prices = product.priceTable.map(p => p.price);
                            const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            const categoryName = product.category?.name || categories.find(c => c.id === product.categoryId)?.name || 'N/A';
                            
                            return (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(product.id, !!product.isFeatured)} aria-label={product.isFeatured ? `Remover ${product.name} dos destaques` : `Adicionar ${product.name} aos destaques`}>
                                            <Star className={`h-5 w-5 transition-colors ${product.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                                            <Image 
                                                src={product.images[0] && product.images[0].startsWith('http') ? product.images[0] : '/images/placeholder.png'} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover"
                                                unoptimized 
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{categoryName}</TableCell>
                                    
                                    <TableCell>R$ {startingPrice.toFixed(2)}</TableCell>

                                    <TableCell className="text-right">
                                        {/* ✅ CORREÇÃO 2: Adicionados aria-labels para os testes encontrarem os botões */}
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