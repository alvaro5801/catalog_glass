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
    expect(() => new Category(2, invalidName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome vazio', () => {
    const emptyName = "  ";
    expect(() => new Category(3, emptyName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria sem nome', () => {
    // ✅ CORREÇÃO: Alterado de @ts-ignore para @ts-expect-error
    // @ts-expect-error - Estamos a testar intencionalmente um tipo inválido.
    expect(() => new Category(4, null)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

});