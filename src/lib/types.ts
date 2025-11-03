// src/lib/types.ts
export type Product = {
  id: string; // ✅ ALTERAÇÃO: de 'number' para 'string'
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  images: string[];
  specifications: {
    material: string;
    capacidade: string;
    dimensoes: string;
  };
  priceTable: { quantity: string; price: number }[];
  priceInfo: string;
  category: string;
  isFeatured?: boolean;
};