// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit, Loader2, AlertCircle, CheckCircle } from "lucide-react";

// 1. Componente para exibir mensagens de feedback (sucesso ou erro)
function FeedbackMessage({ type, message }: { type: 'success' | 'error', message: string }) {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    const colorClasses = isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    if (!message) return null;

    return (
        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${colorClasses}`}>
            <Icon className="h-4 w-4" />
            <span>{message}</span>
        </div>
    );
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    
    // 2. Estados para controlar o carregamento de ações e o feedback
    const [loadingAction, setLoadingAction] = useState<{ action: 'add' | 'edit' | 'delete' | null, target: string | null }>({ action: null, target: null });
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Efeito para limpar a mensagem de feedback após alguns segundos
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // --- EFEITO PARA CARREGAR OS DADOS INICIAIS (GET) ---
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Falha ao buscar categorias:", error);
                setFeedback({ type: 'error', message: 'Não foi possível carregar as categorias.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // --- FUNÇÃO PARA ADICIONAR (POST) ---
    const handleAddCategory = async () => {
        if (!newCategory) return;
        setLoadingAction({ action: 'add', target: null });
        setFeedback(null);
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });
            if (!response.ok) throw new Error('Falha ao adicionar');
            const updatedCategories = await response.json();
            setCategories(updatedCategories);
            setNewCategory("");
            setFeedback({ type: 'success', message: 'Categoria adicionada com sucesso!' });
        } catch (error) {
            console.error("Erro:", error);
            setFeedback({ type: 'error', message: 'Erro ao adicionar a categoria.' });
        } finally {
            setLoadingAction({ action: null, target: null });
        }
    };

    // --- FUNÇÃO PARA APAGAR (DELETE) ---
    const handleDeleteCategory = async (categoryToDelete: string) => {
        setLoadingAction({ action: 'delete', target: categoryToDelete });
        setFeedback(null);
        try {
            const response = await fetch(`/api/categories/${encodeURIComponent(categoryToDelete)}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Falha ao apagar');
            const updatedCategories = await response.json();
            setCategories(updatedCategories);
            setFeedback({ type: 'success', message: 'Categoria apagada com sucesso!' });
        } catch (error) {
            console.error("Erro:", error);
            setFeedback({ type: 'error', message: 'Erro ao apagar a categoria.' });
        } finally {
            setLoadingAction({ action: null, target: null });
        }
    };

    // --- FUNÇÕES PARA EDITAR (PUT) ---
    const handleEditStart = (categoryToEdit: string) => {
        setEditingCategory(categoryToEdit);
        setEditingText(categoryToEdit);
    };

    const handleEditSave = async (originalCategory: string) => {
        setLoadingAction({ action: 'edit', target: originalCategory });
        setFeedback(null);
        try {
            const response = await fetch(`/api/categories/${encodeURIComponent(originalCategory)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: editingText }),
            });
            if (!response.ok) throw new Error('Falha ao editar');
            const updatedCategories = await response.json();
            setCategories(updatedCategories);
            setEditingCategory(null);
            setFeedback({ type: 'success', message: 'Categoria atualizada com sucesso!' });
        } catch (error) {
            console.error("Erro:", error);
            setFeedback({ type: 'error', message: 'Erro ao atualizar a categoria.' });
        } finally {
            setLoadingAction({ action: null, target: null });
        }
    };

    if (isLoading) return <p>A carregar categorias...</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestão de Categorias</h2>
            
            {/* 3. Local para exibir as mensagens de feedback */}
            {feedback && <FeedbackMessage type={feedback.type} message={feedback.message} />}

            <div className="p-6 border bg-card rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h3>
                <div className="flex gap-2 mb-8">
                    <Input placeholder="Nome da categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                    <Button onClick={handleAddCategory} disabled={loadingAction.action === 'add'}>
                        {loadingAction.action === 'add' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <PlusCircle className="mr-2 h-4 w-4" />
                        )}
                        Adicionar
                    </Button>
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
                                    <Button size="sm" onClick={() => handleEditSave(cat)} disabled={loadingAction.action === 'edit'}>
                                        {loadingAction.action === 'edit' && loadingAction.target === cat && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleEditStart(cat)} aria-label={`Editar ${cat}`}><Edit className="h-4 w-4" /></Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDeleteCategory(cat)} 
                                  aria-label={`Apagar ${cat}`}
                                  disabled={loadingAction.action === 'delete' && loadingAction.target === cat}
                                >
                                    {loadingAction.action === 'delete' && loadingAction.target === cat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}