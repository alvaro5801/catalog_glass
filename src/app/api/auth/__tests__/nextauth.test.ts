// src/app/api/auth/__tests__/nextauth.test.ts

/**
 * 🧩 Mocks devem vir antes de qualquer import real!
 */
jest.mock('@/lib/prisma');
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: { compare: jest.fn() },
}));

// ✅ Novo Mock para o Rate Limit
jest.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: jest.fn(),
  },
}));

import type { User, Awaitable } from 'next-auth';

/**
 * Dados Base (constantes para testes)
 */
const MOCK_PASSWORD = 'password123';
const MOCK_HASHED_PASSWORD = 'hashed_password_abc';
const MOCK_TOKEN = '123456';

const mockValidUser = {
  id: 'user-123',
  email: 'teste@exemplo.com',
  name: 'Utilizador Teste',
  hashedPassword: MOCK_HASHED_PASSWORD,
  emailVerified: new Date(),
  image: null,
};

const mockVerificationToken = {
  id: 'token-id-1',
  email: 'teste@exemplo.com',
  token: MOCK_TOKEN,
  expires: new Date(Date.now() + 3600000), // Expira daqui a 1 hora (Futuro)
  userId: 'user-123',
  user: mockValidUser, // O prisma inclui o utilizador aqui
};

describe('Auth API: authorizeCredentials', () => {
  let authorizeCredentials: (
    credentials: Record<string, string> | undefined
  ) => Awaitable<User | null>;

  // Mocks
  let mockUserFindUnique: jest.Mock;
  let mockTokenFindUnique: jest.Mock;
  let mockTokenDelete: jest.Mock;
  let mockTransaction: jest.Mock;
  let mockCompare: jest.Mock;
  let mockRateLimit: jest.Mock; // Variável para o mock do rate limit

  // Guardar o env original para restaurar depois
  const originalEnv = process.env;

  beforeEach(async () => {
    // 1. Limpa a cache de módulos e os mocks anteriores
    jest.resetModules();
    
    // 2. Configurar Variáveis de Ambiente para o teste
    process.env = { 
      ...originalEnv, 
      UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.com' // Garante que o código entra no bloco de rate limit
    };

    // 3. Importar Módulos Mockados
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = (await import('bcryptjs')).default as unknown as { compare: jest.Mock };
    const { ratelimit } = await import('@/lib/ratelimit'); // Importar o mock do ratelimit

    // 4. Configurar referências para os mocks
    mockUserFindUnique = prisma.user.findUnique as jest.Mock;
    mockTokenFindUnique = prisma.emailVerificationToken.findUnique as jest.Mock;
    mockTokenDelete = prisma.emailVerificationToken.delete as jest.Mock;
    mockTransaction = prisma.$transaction as jest.Mock;
    mockCompare = bcrypt.compare;
    mockRateLimit = ratelimit.limit as jest.Mock;

    // 5. Configurar Comportamento Padrão (Sucesso)
    // Por defeito, o rate limit permite a passagem ({ success: true })
    mockRateLimit.mockResolvedValue({ success: true });

    // 6. Importar a função a testar
    const { authorizeCredentials: importedAuthFunc } = await import(
      '../[...nextauth]/route'
    );
    authorizeCredentials = importedAuthFunc;
  });

  afterAll(() => {
    process.env = originalEnv; // Restaurar ambiente original
  });

  // =================================================
  // 🛡️ CENÁRIO: RATE LIMITING (RNF02.1.1)
  // =================================================
  describe('Rate Limiting', () => {
    it('🚫 deve lançar erro se o limite de tentativas for excedido', async () => {
      // Simular falha no rate limit (bloqueio)
      mockRateLimit.mockResolvedValue({ success: false });

      await expect(authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        password: '123' 
      })).rejects.toThrow("Muitas tentativas");

      // Verificar se o limitador foi chamado com a chave correta
      expect(mockRateLimit).toHaveBeenCalledWith('login_teste@exemplo.com');
    });

    it('✅ deve permitir login se o limite não for excedido', async () => {
      mockRateLimit.mockResolvedValue({ success: true });
      mockUserFindUnique.mockResolvedValue(mockValidUser);
      mockCompare.mockResolvedValue(true);

      const user = await authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        password: MOCK_PASSWORD 
      });

      expect(user).not.toBeNull();
      expect(mockRateLimit).toHaveBeenCalled();
    });
  });

  // =================================================
  // 🟢 CENÁRIO A: LOGIN CLÁSSICO (Email + Senha)
  // =================================================
  describe('Cenário A: Login com Senha', () => {
    
    it('✅ deve autenticar com senha correta', async () => {
      mockUserFindUnique.mockResolvedValue(mockValidUser);
      mockCompare.mockResolvedValue(true);

      const user = await authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        password: MOCK_PASSWORD 
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { email: 'teste@exemplo.com' } });
      expect(mockCompare).toHaveBeenCalledWith(MOCK_PASSWORD, MOCK_HASHED_PASSWORD);
      expect(user).toEqual({
        id: 'user-123',
        email: 'teste@exemplo.com',
        name: 'Utilizador Teste',
        image: null,
      });
    });

    it('🚫 deve falhar se utilizador não existir', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      const user = await authorizeCredentials({ email: 'naoexiste@exemplo.com', password: MOCK_PASSWORD });
      expect(user).toBeNull();
    });

    it('🚫 deve falhar se a senha estiver errada', async () => {
      mockUserFindUnique.mockResolvedValue(mockValidUser);
      mockCompare.mockResolvedValue(false);
      const user = await authorizeCredentials({ email: 'teste@exemplo.com', password: 'errada' });
      expect(user).toBeNull();
    });
  });

  // =================================================
  // 🔵 CENÁRIO B: LOGIN VIA TOKEN (RF01.4)
  // =================================================
  describe('Cenário B: Login via Token', () => {

    it('✅ deve autenticar e ativar conta com token válido', async () => {
      // Simular que o token existe na BD e é válido
      mockTokenFindUnique.mockResolvedValue(mockVerificationToken);
      mockTransaction.mockResolvedValue(true); // Simula sucesso da transação

      const user = await authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        token: MOCK_TOKEN // Enviamos token em vez de senha
      });

      // 1. Verificou se o token existe?
      expect(mockTokenFindUnique).toHaveBeenCalledWith({
        where: {
          email_token: {
            email: 'teste@exemplo.com',
            token: MOCK_TOKEN,
          },
        },
        include: { user: true },
      });

      // 2. Executou a transação (Update User + Delete Token)?
      expect(mockTransaction).toHaveBeenCalled();

      // 3. Verificou se a função de apagar o token foi chamada?
      expect(mockTokenDelete).toHaveBeenCalledWith({
        where: { id: mockVerificationToken.id },
      });
      
      // 4. Retornou o utilizador?
      expect(user).toEqual({
        id: 'user-123',
        email: 'teste@exemplo.com',
        name: 'Utilizador Teste',
        image: null,
      });
    });

    it('🚫 deve falhar se o token não for encontrado', async () => {
      mockTokenFindUnique.mockResolvedValue(null); // Token não existe

      const user = await authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        token: '999999' // Token errado
      });

      expect(user).toBeNull();
      expect(mockTransaction).not.toHaveBeenCalled(); // Não deve tentar apagar nada
    });

    it('🚫 deve falhar se o token estiver expirado', async () => {
      // Criar token expirado (1 hora atrás)
      const expiredToken = {
        ...mockVerificationToken,
        expires: new Date(Date.now() - 3600000), 
      };
      mockTokenFindUnique.mockResolvedValue(expiredToken);

      const user = await authorizeCredentials({ 
        email: 'teste@exemplo.com', 
        token: MOCK_TOKEN 
      });

      expect(user).toBeNull(); // Deve rejeitar
      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });
});