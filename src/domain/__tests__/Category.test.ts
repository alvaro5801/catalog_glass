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

  // ✅ NOVO TESTE UNITÁRIO ADICIONADO AQUI
  it('deve remover os espaços em branco do início e do fim do nome', () => {
    const categoryNameWithSpaces = "  Sobremesas  ";
    const expectedName = "Sobremesas";
    const category = new Category(2, categoryNameWithSpaces);

    // Verificamos se o nome armazenado na instância é a versão "limpa"
    expect(category.name).toBe(expectedName);
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome muito curto', () => {
    const invalidName = "a";
    expect(() => new Category(3, invalidName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria com um nome vazio', () => {
    const emptyName = "  "; // Este nome, após o trim(), fica vazio e falha na validação de tamanho
    expect(() => new Category(4, emptyName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  it('deve lançar um erro ao tentar criar uma categoria sem nome', () => {
    // @ts-expect-error - Estamos a testar intencionalmente um tipo inválido.
    expect(() => new Category(5, null)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

});