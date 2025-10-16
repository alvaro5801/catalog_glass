// src/domain/models/Product.ts
import type { Product as ProductType } from '@/lib/types'; // Reutiliza o tipo que já tem

export class Product {
  id: number;
  name: string;
  category: string;
  // Usamos a tabela de preços para encontrar o menor preço
  private priceTable: { quantity: string; price: number }[];

  constructor(data: ProductType) {
    // Regra 1: O nome do produto deve ser válido
    if (!data.name || data.name.trim().length < 3) {
      throw new Error("O nome do produto deve ter pelo menos 3 caracteres.");
    }

    // ✅ NOVA REGRA: A tabela de preços não pode estar vazia
    if (!data.priceTable || data.priceTable.length === 0) {
      throw new Error("O produto deve ter uma tabela de preços.");
    }

    // Regra 3: Nenhum preço na tabela pode ser negativo
    if (data.priceTable.some(p => p.price < 0)) {
      throw new Error("O preço de um produto não pode ser negativo.");
    }

    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.priceTable = data.priceTable;
  }

  // Lógica de Negócio: Obter o menor preço do produto
  get startingPrice(): number {
    // Adicionamos uma segurança para o caso de a tabela estar vazia (embora a regra acima já proteja)
    if (this.priceTable.length === 0) return 0;
    return Math.min(...this.priceTable.map(p => p.price));
  }
}