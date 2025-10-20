// src/app/api/users/__tests__/route.test.ts
import { POST } from '../route'; // A função que queremos testar
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// 1. Simular ("mock") as dependências externas (Prisma e Bcrypt)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

// 2. Criar referências "tipadas" para os nossos mocks para facilitar o uso
const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;

describe('API Route: /api/users (POST)', () => {

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    mockFindUnique.mockClear();
    mockCreate.mockClear();
    mockHash.mockClear();
  });

  // 3. Teste de Sucesso (201 Created)
  it('deve criar um novo utilizador com senha "hashed" e retornar 201', async () => {
    // Configuração dos mocks
    mockFindUnique.mockResolvedValue(null); // Simula que o e-mail NÃO existe
    mockHash.mockResolvedValue('senha_hashed_123'); // Simula o resultado do hash
    const mockNewUser = { id: 'user-1', name: 'Utilizador Teste', email: 'teste@email.com' };
    mockCreate.mockResolvedValue(mockNewUser); // Simula a criação no banco

    const requestBody = { name: 'Utilizador Teste', email: 'teste@email.com', password: 'senhaForte123' };
    const request = new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Executar a função POST
    const response = await POST(request);
    const body = await response.json();

    // Verificações
    expect(response.status).toBe(201); // Verifica o status HTTP
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'teste@email.com' } }); // Verificou se o user existia?
    expect(mockHash).toHaveBeenCalledWith('senhaForte123', 10); // Hashou a senha?
    expect(mockCreate).toHaveBeenCalledWith({ // Criou o user com a senha hashed?
      data: {
        name: 'Utilizador Teste',
        email: 'teste@email.com',
        password: 'senha_hashed_123',
      },
    });
    expect(body.password).toBeUndefined(); // A senha NUNCA deve ser retornada
    expect(body.name).toBe('Utilizador Teste');
  });

  // 4. Teste de Conflito (409 Conflict)
  it('deve retornar 409 se o e-mail já existir', async () => {
    // Configuração do mock
    mockFindUnique.mockResolvedValue({ id: 'user-existente', email: 'teste@email.com' }); // Simula que o e-mail JÁ existe

    const requestBody = { name: 'Utilizador Teste', email: 'teste@email.com', password: 'senhaForte123' };
    const request = new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Executar a função POST
    const response = await POST(request);
    const body = await response.json();

    // Verificações
    expect(response.status).toBe(409); // Verifica o status de conflito
    expect(body.error).toBe("Este e-mail já está em uso."); // Verifica a mensagem de erro
    expect(mockCreate).not.toHaveBeenCalled(); // NÃO deve tentar criar o utilizador
    expect(mockHash).not.toHaveBeenCalled(); // NEM deve fazer o hash da senha
  });

  // 5. Teste de Dados Inválidos (400 Bad Request)
  it('deve retornar 400 se faltarem campos obrigatórios', async () => {
    // Enviar um body sem o campo 'name'
    const requestBody = { email: 'teste@email.com', password: 'senhaForte123' };
    const request = new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Executar a função POST
    const response = await POST(request);
    const body = await response.json();

    // Verificações
    expect(response.status).toBe(400); // Verifica o status de Bad Request
    expect(body.error).toBe("Todos os campos são obrigatórios.");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});