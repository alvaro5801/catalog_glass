// src/domain/__tests__/Product.test.ts
import { Product } from '../models/Product';
import { products } from '@/data/products'; // Usamos um produto real para o teste

describe('Product Entity', () => {

  const validProductData = products[0]; // Pega no "Copo Long Drink"

  it('deve criar uma instância de Product com dados válidos', () => {
    const product = new Product(validProductData);
    expect(product).toBeInstanceOf(Product);
    expect(product.name).toBe(validProductData.name);
  });

  it('deve calcular o preço inicial corretamente', () => {
    const product = new Product(validProductData);
    // A tabela de preços do "Copo Long Drink" é [4.5, 4.2, 3.9, 3.5]
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

});