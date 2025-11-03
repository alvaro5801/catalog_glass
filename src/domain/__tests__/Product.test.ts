// src/domain/__tests__/Product.test.ts
import { Product } from '../models/Product';
import type { Product as ProductType } from '@/lib/types'; // Importar o tipo do frontend para consistência

describe('Product Entity', () => {

  // ✅ ALTERAÇÃO: Criamos um objeto de teste local em vez de importar de um ficheiro externo.
  // Isto torna o teste unitário verdadeiramente independente.
  const validProductData: ProductType = {
    id: 'clxrz8hax00013b6khe69046d', // ID agora é uma string
    slug: 'copo-long-drink-personalizado',
    name: 'Copo Long Drink Personalizado',
    shortDescription: 'Ideal para festas, eventos e brindes corporativos.',
    description: 'O Copo Long Drink é um clássico versátil para qualquer ocasião.',
    images: ['/images/products/long-drink-1.jpg'],
    specifications: { material: 'Acrílico', capacidade: '350ml', dimensoes: '15cm altura' },
    priceTable: [
      { quantity: '50-99 unidades', price: 3.9 },
      { quantity: '100+ unidades', price: 3.5 },
    ],
    priceInfo: 'O valor inclui personalização em 1 cor.',
    category: 'Copos',
  };

  it('deve criar uma instância de Product com dados válidos', () => {
    const product = new Product(validProductData);
    expect(product).toBeInstanceOf(Product);
    expect(product.name).toBe(validProductData.name);
  });

  it('deve calcular o preço inicial corretamente com múltiplos preços', () => {
    const product = new Product(validProductData);
    // O menor preço na nossa tabela de teste é 3.5
    expect(product.startingPrice).toBe(3.5);
  });

  it('deve lançar um erro se o nome for muito curto', () => {
    const invalidData = { ...validProductData, name: "A" };
    expect(() => new Product(invalidData)).toThrow("O nome do produto deve ter pelo menos 3 caracteres.");
  });

  it('deve lançar um erro se o preço for negativo', () => {
    const invalidData = { ...validProductData, priceTable: [{ quantity: '1', price: -10 }] };
    expect(() => new Product(invalidData)).toThrow("O preço de um produto não pode ser negativo.");
  });

  it('deve lançar um erro se a tabela de preços estiver vazia', () => {
    const invalidData = { ...validProductData, priceTable: [] };
    expect(() => new Product(invalidData)).toThrow("O produto deve ter uma tabela de preços.");
  });

  it('deve calcular o preço inicial corretamente quando há apenas um preço', () => {
    const singlePriceData = {
      ...validProductData,
      priceTable: [{ quantity: '1-10 unidades', price: 9.90 }]
    };
    const product = new Product(singlePriceData);
    expect(product.startingPrice).toBe(9.90);
  });
});