// src/domain/__tests__/Category.test.ts
import { Category } from '../models/Category';

describe('Category Entity', () => {

  it('deve criar uma instância de Category com sucesso com um nome válido', () => {
    const categoryName = "Bebidas";
    const category = new Category('cat_1', categoryName); // ✅ ALTERAÇÃO: ID é string

    expect(category).toBeInstanceOf(Category);
    expect(category.id).toBe('cat_1');
    expect(category.name).toBe(categoryName);
  });

  it('deve remover os espaços em branco do início e do fim do nome', () => {
    const categoryNameWithSpaces = "  Sobremesas  ";
    const expectedName = "Sobremesas";
    const category = new Category('cat_2', categoryNameWithSpaces); // ✅ ALTERAÇÃO: ID é string
    expect(category.name).toBe(expectedName);
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome muito curto', () => {
    const invalidName = "a";
    expect(() => new Category('cat_3', invalidName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });
});