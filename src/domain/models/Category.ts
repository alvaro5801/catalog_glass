// src/domain/models/Category.ts
export class Category {
  id: string; // ✅ ALTERAÇÃO: de 'number' para 'string'
  name: string;

  constructor(id: string, name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error("O nome da categoria deve ter pelo menos 2 caracteres.");
    }

    this.id = id;
    this.name = name.trim();
  }
}