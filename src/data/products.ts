// src/data/products.ts
import type { Product } from '../lib/types';

export const products: Product[] = [
  {
    id: 1,
    slug: 'copo-long-drink-personalizado',
    name: 'Copo Long Drink Personalizado',
    shortDescription: 'Ideal para festas, eventos e brindes corporativos.',
    description:
      'O Copo Long Drink é um clássico versátil para qualquer ocasião. Feito de acrílico resistente, pode ser personalizado com sua marca, nome ou design exclusivo em alta qualidade de impressão.',
    // Imagens existentes mantidas
    images: ['/images/products/long-drink-1.jpg', '/images/products/long-drink-2.jpg', '/images/products/long-drink-3.jpg'],
    specifications: { material: 'Acrílico Poliestireno', capacidade: '350ml', dimensoes: '15cm altura x 6cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 4.5 },
      { quantity: '30-49 unidades', price: 4.2 },
      { quantity: '50-99 unidades', price: 3.9 },
      { quantity: '100+ unidades', price: 3.5 },
    ],
    priceInfo: 'O valor inclui personalização em 1 cor.',
    category: 'Copos',
  },
  {
    id: 2,
    slug: 'taca-gin-acrilico-metalizada',
    name: 'Taça de Gin Acrílico Metalizada',
    shortDescription: 'Elegância e modernidade para seus drinks.',
    description: 'Surpreenda seus convidados com a Taça de Gin Metalizada. Com um design sofisticado e acabamento impecável, é perfeita para eventos que pedem um toque de glamour. Personalize e crie um brinde inesquecível.',
    // Imagens existentes mantidas
    images: ['/images/products/taca-gin-1.jpg', '/images/products/taca-gin-2.jpg'],
    specifications: { material: 'Acrílico com pintura metalizada', capacidade: '580ml', dimensoes: '20cm altura x 10cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 12.0 },
      { quantity: '30-49 unidades', price: 11.5 },
      { quantity: '50+ unidades', price: 10.8 },
    ],
    priceInfo: 'Personalização a laser inclusa.',
    category: 'Taças',
  },
  {
    id: 3,
    slug: 'caneca-ceramica-sublimatica',
    name: 'Caneca de Cerâmica Sublimática',
    shortDescription: 'O presente perfeito para qualquer ocasião.',
    description: 'Uma caneca de cerâmica de alta qualidade, ideal para sublimação com fotos, logótipos ou qualquer design. Perfeita para brindes corporativos, presentes de aniversário ou para o café da manhã.',
    // Imagens existentes mantidas
    images: ['/images/products/caneca-1.jpg', '/images/products/caneca-2.jpg'],
    specifications: { material: 'Cerâmica AAA', capacidade: '325ml', dimensoes: '9.5cm altura x 8cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 15.0 },
      { quantity: '30-49 unidades', price: 14.2 },
      { quantity: '50+ unidades', price: 13.5 },
    ],
    priceInfo: 'Impressão por sublimação sem limite de cores.',
    category: 'Canecas',
  },
  {
    id: 4,
    slug: 'copo-termico-inox',
    name: 'Copo Térmico de Inox',
    shortDescription: 'Sua bebida na temperatura ideal por mais tempo.',
    description: 'Este copo térmico de aço inoxidável com parede dupla mantém a sua bebida quente ou fria por horas. Ideal para o dia a dia, viagens ou para a praia. Personalize a laser com a sua marca.',
    // Alterado para a imagem de placeholder
    images: ['/images/products/placeholder.jpg'],
    specifications: { material: 'Aço Inoxidável', capacidade: '500ml', dimensoes: '17cm altura x 7cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 25.0 },
      { quantity: '30-49 unidades', price: 23.5 },
      { quantity: '50+ unidades', price: 22.0 },
    ],
    priceInfo: 'Inclui tampa e personalização a laser.',
    category: 'Copos',
  },
  {
    id: 5,
    slug: 'squeeze-aluminio-mosquetao',
    name: 'Squeeze de Alumínio com Mosquetão',
    shortDescription: 'Leve sua marca para todo o lado.',
    description: 'Squeeze de alumínio leve e resistente, perfeito para atividades desportivas e para o dia a dia. Vem com uma tampa de rosca segura e um mosquetão para prender na mochila.',
    // Alterado para a imagem de placeholder
    images: ['/images/products/placeholder.jpg'],
    specifications: { material: 'Alumínio', capacidade: '600ml', dimensoes: '21cm altura x 7cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 18.0 },
      { quantity: '30-49 unidades', price: 17.0 },
      { quantity: '50+ unidades', price: 16.0 },
    ],
    priceInfo: 'Personalização em serigrafia ou laser.',
    category: 'Squeezes',
  },
  {
    id: 6,
    slug: 'copo-whisky-vidro-personalizado',
    name: 'Copo de Whisky de Vidro',
    shortDescription: 'Sofisticação para apreciadores de whisky.',
    description: 'Copo de vidro robusto com design clássico para whisky. A personalização a laser confere um toque de exclusividade, ideal para presentes e bares.',
    // Alterado para a imagem de placeholder
    images: ['/images/products/placeholder.jpg'],
    specifications: { material: 'Vidro', capacidade: '290ml', dimensoes: '9cm altura x 8cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 22.0 },
      { quantity: '30-49 unidades', price: 20.5 },
      { quantity: '50+ unidades', price: 19.0 },
    ],
    priceInfo: 'Personalização a laser de alta precisão.',
    category: 'Copos',
  },
  {
    id: 7,
    slug: 'taca-champanhe-vidro',
    name: 'Taça de Champanhe de Vidro',
    shortDescription: 'Celebre momentos especiais com elegância.',
    description: 'Taça de champanhe de vidro com design fino e elegante, perfeita para casamentos, formaturas e celebrações. Personalize com nomes, datas ou monogramas.',
    // Alterado para a imagem de placeholder
    images: ['/images/products/placeholder.jpg'],
    specifications: { material: 'Vidro', capacidade: '180ml', dimensoes: '22cm altura x 5cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 19.0 },
      { quantity: '30-49 unidades', price: 17.5 },
      { quantity: '50+ unidades', price: 16.0 },
    ],
    priceInfo: 'Personalização a laser.',
    category: 'Taças',
  },
  {
    id: 8,
    slug: 'copo-canudo-acrilico',
    name: 'Copo com Canudo Acrílico',
    shortDescription: 'Prático e divertido para o dia a dia.',
    description: 'Copo de acrílico com parede dupla, tampa e canudo. Ótimo para bebidas frias, sumos e vitaminas. Disponível em várias cores para combinar com a sua marca.',
    // Alterado para a imagem de placeholder
    images: ['/images/products/placeholder.jpg'],
    specifications: { material: 'Acrílico', capacidade: '450ml', dimensoes: '16cm altura x 10cm diâmetro' },
    priceTable: [
      { quantity: '10-29 unidades', price: 14.0 },
      { quantity: '30-49 unidades', price: 13.0 },
      { quantity: '50+ unidades', price: 12.0 },
    ],
    priceInfo: 'Inclui tampa e canudo. Personalização em serigrafia.',
    category: 'Copos',
  }
];