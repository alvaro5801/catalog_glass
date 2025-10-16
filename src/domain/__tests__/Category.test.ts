// src/domain/__tests__/Category.test.ts
import { Category } from '../models/Category';

describe('Category Entity', () => {

  it('deve criar uma instância de Category com sucesso com um nome válido', () => {
    const categoryName = "Bebidas";
    const category = new Category(1, categoryName);

    expect(category).toBeInstanceOf(Category);
    expect(category.id).toBe(1);
    expect(category.name).toBe(categoryName);
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome muito curto', () => {
    const invalidName = "a";

    // Esperamos que a tentativa de criar a categoria com este nome LANCE UM ERRO.
    // A função dentro de `expect(...).toThrow()` é o código que deve falhar.
    expect(() => new Category(2, invalidName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome vazio', () => {
    const emptyName = "  "; // Nome com apenas espaços

    expect(() => new Category(3, emptyName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria sem nome', () => {
    // @ts-ignore - Ignoramos o erro do TypeScript aqui porque estamos a testar o comportamento em JavaScript
    expect(() => new Category(4, null)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

});