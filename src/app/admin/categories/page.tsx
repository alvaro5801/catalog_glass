// src/app/admin/categories/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit } from "lucide-react";

export default function CategoriesPage() {
    // Estado para guardar a lista de categorias (simulando dados)
    const [categories, setCategories] = useState<string[]>(["Bebidas", "Comidas", "Sobremesas"]);
    // Estado para o valor do campo de texto da nova categoria
    const [newCategory, setNewCategory] = useState("");
    // Estado para saber qual categoria estamos a editar
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    // Estado para o novo nome da categoria que está a ser editada
    const [editingText, setEditingText] = useState("");

    // Função para adicionar uma nova categoria
    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory(""); // Limpa o campo de texto
        }
    };

    // Função para apagar uma categoria
    const handleDeleteCategory = (categoryToDelete: string) => {
        setCategories(categories.filter(cat => cat !== categoryToDelete));
    };

    // Função para começar a editar uma categoria
    const handleEditStart = (categoryToEdit: string) => {
        setEditingCategory(categoryToEdit);
        setEditingText(categoryToEdit); // Pré-preenche o campo com o nome atual
    };
    
    // Função para guardar a categoria editada
    const handleEditSave = (originalCategory: string) => {
        setCategories(categories.map(cat => cat === originalCategory ? editingText : cat));
        setEditingCategory(null); // Sai do modo de edição
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestão de Categorias</h2>
            </div>

            <div className="p-6 border bg-card rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h3>
                <div className="flex gap-2 mb-8">
                    <Input
                        placeholder="Nome da nova categoria"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={handleAddCategory}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                <h3 className="text-xl font-semibold mb-4 border-t pt-6">Categorias Existentes</h3>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat} className="flex items-center justify-between rounded-md bg-muted p-3">
                            {editingCategory === cat ? (
                                // --- Vista de Edição ---
                                <Input
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="mr-2"
                                />
                            ) : (
                                // --- Vista Normal ---
                                <span>{cat}</span>
                            )}

                            <div className="flex items-center gap-2">
                                {editingCategory === cat ? (
                                    <Button size="sm" onClick={() => handleEditSave(cat)}>Guardar</Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleEditStart(cat)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}