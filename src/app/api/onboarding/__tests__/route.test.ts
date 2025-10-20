// src/app/api/onboarding/__tests__/route.test.ts
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// ✅ 1. Definir o mockTx num escopo acessível pelo teste
const mockTx = {
  catalog: { create: jest.fn().mockResolvedValue({ id: 'catalog-123' }) },
  category: {
    createMany: jest.fn().mockResolvedValue({ count: 2 }),
    findFirst: jest.fn().mockResolvedValue({ id: 'category-abc' }),
  },
  product: { create: jest.fn().mockResolvedValue({ id: 'product-xyz' }) },
  user: { update: jest.fn().mockResolvedValue({ id: 'user-test-id' }) },
};

// 2. Simular as dependências externas
jest.mock('@/lib/prisma', () => ({
  prisma: {
    // ✅ 3. A simulação da transação AGORA usa o mockTx externo
    // e retorna APENAS o 'result', como a API real faria.
    $transaction: jest.fn(async (transactionCallback) => {
      // Executamos a função da transação real, passando o nosso 'tx' simulado
      const result = await transactionCallback(mockTx);
      // Retornamos APENAS o resultado da callback
      return result;
    }),
  },
}));

// Simulamos o getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Simular as authOptions (isto já estava correto)
jest.mock('@/app/(auth)/[...nextauth]/route', () => ({
  authOptions: {}, // Exporta um objeto 'authOptions' vazio
}));


// 4. Criar referências tipadas para os mocks
const mockGetServerSession = getServerSession as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;

describe('API Route: /api/onboarding (POST)', () => {

  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    mockGetServerSession.mockClear();
    mockTransaction.mockClear();

    // ✅ 5. Limpar os mocks internos do mockTx externo
    Object.values(mockTx).forEach((model: any) => {
      Object.values(model).forEach((mockFn: any) => {
        if (typeof mockFn === 'function') {
          mockFn.mockClear();
        }
      });
    });
  });

  // 3. Teste de Sucesso (201 Created)
  it('deve criar catálogo, categorias, produto e atualizar utilizador com sucesso', async () => {
    // Configuração do mock da sessão
    const mockSession = { user: { id: 'user-test-id' } };
    mockGetServerSession.mockResolvedValue(mockSession);

    // Dados que o frontend enviaria
    const requestBody = {
      businessName: "Loja Teste",
      categories: ["Categoria A", "Categoria B"],
      product: { name: "Produto Teste", price: "19.99" },
    };
    const request = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Executar a função POST
    const response = await POST(request);
    const body = await response.json(); // 'body' agora será { id: 'catalog-123' }

    // Verificações
    expect(response.status).toBe(201); // Verifica o status HTTP
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // ✅ 6. Já não precisamos de extrair o mockTx, ele está acessível
    // const { mockTx } = await mockTransaction.mock.results[0].value; // LINHA REMOVIDA

    // Verificar se o catálogo foi criado
    expect(mockTx.catalog.create).toHaveBeenCalledWith({
      data: { userId: 'user-test-id' },
    });
    // Verificar se as categorias foram criadas
    expect(mockTx.category.createMany).toHaveBeenCalledWith({
      data: [
        { name: 'Categoria A', catalogId: 'catalog-123' },
        { name: 'Categoria B', catalogId: 'catalog-123' },
      ],
      skipDuplicates: true,
    });
    // Verificar se procurou a primeira categoria
    expect(mockTx.category.findFirst).toHaveBeenCalledWith({
      where: { catalogId: 'catalog-123' },
    });
    // Verificar se o produto foi criado
    expect(mockTx.product.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: 'Produto Teste',
        slug: 'produto-teste',
        catalogId: 'catalog-123',
        categoryId: 'category-abc',
        priceTable: { create: [{ quantity: '1-10', price: 19.99 }] },
      }),
    }));
    // Verificar se o utilizador foi atualizado
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-test-id' },
      data: { onboardingComplete: true },
    });

    // ✅ 7. Esta asserção agora vai PASSAR!
    expect(body).toEqual({ id: 'catalog-123' });
  });

  // 4. Teste Não Autorizado (401 Unauthorized)
  // (Sem alterações, este teste já estava a passar)
  it('deve retornar 401 se não houver sessão', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const requestBody = { businessName: "Loja Teste", categories: [], product: {} };
    const request = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autorizado.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  // 5. Teste de Erro na Transação (500 Internal Server Error)
  // (Este teste já estava a passar e a sua lógica interna de mock não afeta a resposta)
  it('deve retornar 500 se a transação falhar', async () => {
    const mockSession = { user: { id: 'user-test-id' } };
    mockGetServerSession.mockResolvedValue(mockSession);

    // Simular um erro dentro da transação
    // Esta simulação é diferente da simulação de sucesso e funciona bem
    mockTransaction.mockImplementationOnce(async (transactionCallback) => {
      const mockTxWithError = {
        catalog: { create: jest.fn().mockResolvedValue({ id: 'catalog-123' }) },
        category: {
          createMany: jest.fn().mockRejectedValue(new Error("Erro na base de dados")), // Simula falha aqui
          findFirst: jest.fn(),
        },
        product: { create: jest.fn() },
        user: { update: jest.fn() },
      };
      await transactionCallback(mockTxWithError);
    });
    mockTransaction.mockRejectedValue(new Error("Erro simulado na transação"));


    const requestBody = { businessName: "Loja Teste", categories: ["A"], product: {} };
    const request = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Erro interno do servidor");
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });
});