// src/domain/models/Product.ts
import type { Product as ProductType } from '@/lib/types';

export class Product {
  id: string; // ✅ ALTERAÇÃO: de 'number' para 'string'
  name: string;
  category: string;
  private priceTable: { quantity: string; price: number }[];

  constructor(data: ProductType) {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error("O nome do produto deve ter pelo menos 3 caracteres.");
    }
    if (!data.priceTable || data.priceTable.length === 0) {
      throw new Error("O produto deve ter uma tabela de preços.");
    }
    if (data.priceTable.some(p => p.price < 0)) {
      throw new Error("O preço de um produto não pode ser negativo.");
    }

    this.id = data.id; // Já espera uma string
    this.name = data.name;
    this.category = data.category;
    this.priceTable = data.priceTable;
  }

  get startingPrice(): number {
    if (this.priceTable.length === 0) return 0;
    return Math.min(...this.priceTable.map(p => p.price));
  }
}