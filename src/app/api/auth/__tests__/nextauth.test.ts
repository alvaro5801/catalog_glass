// src/app/api/auth/__tests__/nextauth.test.ts

/**
 * 🧩 Mocks devem vir antes de qualquer import real!
 * Colocamos estes no topo para que o Jest saiba quais os ficheiros a simular.
 */
jest.mock('@/lib/prisma');
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: { compare: jest.fn() },
}));

// --- ✅ CORREÇÃO 1: Importamos TODOS os TIPOS no topo ---
// Estes não afetam o runtime e corrigem o erro 'User is defined but never used'
// porque o tipo 'User' é necessário para a variável 'authorizeFunction'.
import type { User, Awaitable } from 'next-auth';

/**
 * Dados base (constantes são seguras para definir aqui)
 */
const MOCK_PASSWORD = 'password123';
const MOCK_HASHED_PASSWORD = 'hashed_password_abc';

const mockValidUser = {
  id: 'user-123',
  email: 'teste@exemplo.com',
  name: 'Utilizador Teste',
  hashedPassword: MOCK_HASHED_PASSWORD,
  emailVerified: new Date(),
  image: null,
};

describe('Auth API: authorizeCredentials', () => {
  // --- As nossas variáveis de teste (apenas declaradas) ---
  let authorizeCredentials: (
    credentials: Record<string, string> | undefined
  ) => Awaitable<User | null>; // O tipo 'User' é usado aqui

  let mockFindUnique: jest.Mock;
  let mockCompare: jest.Mock;

  // --- O beforeEach faz todo o trabalho de importação ---
  beforeEach(async () => {
    // 1. Limpa a cache de módulos.
    jest.resetModules();

    // 2. Importa os MÓDULOS SIMULADOS primeiro (como valores)
    const { prisma } = await import('@/lib/prisma');
    
    // ✅ CORREÇÃO 2: Importamos o 'bcrypt' de forma segura
    // Em: src/app/api/auth/__tests__/nextauth.test.ts (dentro do beforeEach)
const bcrypt = (await import('bcryptjs')).default as unknown as { compare: jest.Mock };

    // 3. Atribui as funções simuladas às nossas variáveis de teste
    mockFindUnique = prisma.user.findUnique as jest.Mock;
    mockCompare = bcrypt.compare; // Não precisamos de 'as any'

    // 4. AGORA, importa o nosso código (como valor)
    // Isto força a importação da *nova* versão da rota, que usa os mocks
    const { authorizeCredentials: importedAuthFunc } = await import(
      '../[...nextauth]/route'
    );
    
    authorizeCredentials = importedAuthFunc;
  });

  // Os teus testes ('it' blocks) permanecem exatamente iguais.
  // Eles devem FINALMENTE passar.

  it('✅ deve autenticar e retornar o objeto User em caso de sucesso', async () => {
    mockFindUnique.mockResolvedValue(mockValidUser);
    mockCompare.mockResolvedValue(true);

    const credentials = { email: 'Teste@Exemplo.com', password: MOCK_PASSWORD };
    const user = await authorizeCredentials(credentials);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'teste@exemplo.com' },
    });
    expect(mockCompare).toHaveBeenCalledWith(MOCK_PASSWORD, MOCK_HASHED_PASSWORD);
    expect(user).toEqual({
      id: 'user-123',
      email: 'teste@exemplo.com',
      name: 'Utilizador Teste',
      image: null,
    });
  });

  it('🚫 deve retornar null se o utilizador não for encontrado', async () => {
    mockFindUnique.mockResolvedValue(null);
    const credentials = { email: 'naoexiste@exemplo.com', password: MOCK_PASSWORD };
    const user = await authorizeCredentials(credentials);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'naoexiste@exemplo.com' },
    });
    expect(mockCompare).not.toHaveBeenCalled();
    expect(user).toBeNull();
  });

  it('🚫 deve retornar null se o e-mail não estiver verificado', async () => {
    const unverifiedUser = { ...mockValidUser, emailVerified: null };
    mockFindUnique.mockResolvedValue(unverifiedUser);
    const credentials = { email: 'teste@exemplo.com', password: MOCK_PASSWORD };
    const user = await authorizeCredentials(credentials);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockCompare).not.toHaveBeenCalled();
    expect(user).toBeNull();
  });

  it('🚫 deve retornar null se a senha for inválida', async () => {
    mockFindUnique.mockResolvedValue(mockValidUser);
    mockCompare.mockResolvedValue(false);
    const credentials = { email: 'teste@exemplo.com', password: 'senhaerrada' };
    const user = await authorizeCredentials(credentials);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockCompare).toHaveBeenCalledWith('senhaerrada', MOCK_HASHED_PASSWORD);
    expect(user).toBeNull();
  });

  it('🚫 deve retornar null se credenciais estiverem ausentes ou incompletas', async () => {
    const user1 = await authorizeCredentials({ email: 'teste@exemplo.com', password: '' });
    const user2 = await authorizeCredentials({ email: '', password: '123' });
    const user3 = await authorizeCredentials(undefined);

    expect(user1).toBeNull();
    expect(user2).toBeNull();
    expect(user3).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCompare).not.toHaveBeenCalled();
  });
});