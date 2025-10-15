// src/domain/models/Category.ts

export class Category {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    // Regra de Negócio: Validação do nome
    if (!name || name.trim().length < 2) {
      throw new Error("O nome da categoria deve ter pelo menos 2 caracteres.");
    }

    this.id = id;
    this.name = name.trim(); // Armazena o nome sem espaços extras
  }
}