// src/domain/__tests__/Product.test.ts
import { Product } from '../models/Product';
import { products } from '@/data/products';

describe('Product Entity', () => {

  const validProductData = products[0];

  it('deve criar uma instância de Product com dados válidos', () => {
    const product = new Product(validProductData);
    expect(product).toBeInstanceOf(Product);
    expect(product.name).toBe(validProductData.name);
  });

  it('deve calcular o preço inicial corretamente com múltiplos preços', () => {
    const product = new Product(validProductData);
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

  // ✅ NOVO TESTE UNITÁRIO ADICIONADO AQUI
  it('deve calcular o preço inicial corretamente quando há apenas um preço', () => {
    // Prepara dados de um produto com apenas uma faixa de preço
    const singlePriceData = {
      ...validProductData,
      priceTable: [{ quantity: '1-10 unidades', price: 9.90 }]
    };

    const product = new Product(singlePriceData);

    // Espera que o preço inicial seja o único preço disponível
    expect(product.startingPrice).toBe(9.90);
  });
});