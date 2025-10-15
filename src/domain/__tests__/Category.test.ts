// src/domain/__tests__/Category.test.ts
import { Category } from '../models/Category';

// Descreve o conjunto de testes para a nossa entidade Category
describe('Category Entity', () => {

  // Teste 1: O "caminho feliz"
  it('deve criar uma instância de Category com sucesso com um nome válido', () => {
    const categoryName = "Bebidas";
    const category = new Category(1, categoryName);

    // Verifica se o objeto foi criado
    expect(category).toBeInstanceOf(Category);
    // Verifica se as propriedades foram atribuídas corretamente
    expect(category.id).toBe(1);
    expect(category.name).toBe(categoryName);
  });

  // Teste 2: Testar a regra de negócio para nomes curtos
  it('deve lançar um erro ao tentar criar uma categoria com um nome muito curto', () => {
    const invalidName = "a";

    // Esperamos que a tentativa de criar a categoria com este nome LANCE UM ERRO.
    // A função dentro de `expect(...).toThrow()` é o código que deve falhar.
    expect(() => new Category(2, invalidName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  // Teste 3: Testar a regra de negócio para nomes vazios
  it('deve lançar um erro ao tentar criar uma categoria com um nome vazio', () => {
    const emptyName = "  "; // Nome com apenas espaços

    expect(() => new Category(3, emptyName)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

  // Teste 4: Testar a regra de negócio para nomes nulos/undefined
  it('deve lançar um erro ao tentar criar uma categoria sem nome', () => {
    // @ts-ignore - Ignoramos o erro do TypeScript aqui porque estamos a testar o comportamento em JavaScript
    expect(() => new Category(4, null)).toThrow("O nome da categoria deve ter pelo menos 2 caracteres.");
  });

});