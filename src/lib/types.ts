// Definição do tipo Product
export type Product = {
  id: number;
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
  isFeatured?: boolean; // ✅ CORREÇÃO: Propriedade opcional adicionada aqui
};