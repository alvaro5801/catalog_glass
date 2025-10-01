// src/data/products.ts
import type { Product } from '../lib/types';

export const products: Product[] = [
  {
    id: 1,
    slug: "copo-long-drink-personalizado",
    name: "Copo Long Drink Personalizado",
    shortDescription: "Ideal para festas, eventos e brindes corporativos.",
    description:
      "O Copo Long Drink é um clássico versátil para qualquer ocasião. Feito de acrílico resistente, pode ser personalizado com sua marca, nome ou design exclusivo em alta qualidade de impressão.",
    images: [
      "/images/products/long-drink-1.jpg",
      "/images/products/long-drink-2.jpg",
      "/images/products/long-drink-3.jpg",
    ],
    specifications: {
      material: "Acrílico Poliestireno",
      capacidade: "350ml",
      dimensoes: "15cm altura x 6cm diâmetro",
    },
    priceTable: [
      { quantity: "10-29 unidades", price: 4.5 },
      { quantity: "30-49 unidades", price: 4.2 },
      { quantity: "50-99 unidades", price: 3.9 },
      { quantity: "100+ unidades", price: 3.5 },
    ],
    priceInfo: "O valor inclui personalização em 1 cor.",
    category: "Copos",
  },
  {
    id: 2,
    slug: "taca-gin-acrilico-metalizada",
    name: "Taça de Gin Acrílico Metalizada",
    shortDescription: "Elegância e modernidade para seus drinks.",
    description:
      "Surpreenda seus convidados com a Taça de Gin Metalizada. Com um design sofisticado e acabamento impecável, é perfeita para eventos que pedem um toque de glamour. Personalize e crie um brinde inesquecível.",
    images: ["/images/products/taca-gin-1.jpg", "/images/products/taca-gin-2.jpg"],
    specifications: {
      material: "Acrílico com pintura metalizada",
      capacidade: "580ml",
      dimensoes: "20cm altura x 10cm diâmetro",
    },
    priceTable: [
      { quantity: "10-29 unidades", price: 12.0 },
      { quantity: "30-49 unidades", price: 11.5 },
      { quantity: "50+ unidades", price: 10.8 },
    ],
    priceInfo: "Personalização a laser inclusa.",
    category: "Taças",
  },
];