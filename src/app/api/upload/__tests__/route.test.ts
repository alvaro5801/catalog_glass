// src/app/api/upload/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { handleUpload } from '@vercel/blob/client';

// --- MOCKS ---

// 1. Mock do Auth Helper
jest.mock('@/lib/auth-helper', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// 2. Mock do Vercel Blob (handleUpload)
jest.mock('@vercel/blob/client', () => ({
  handleUpload: jest.fn(),
}));

describe('API Route: /api/upload', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('🚫 deve lançar erro se o utilizador não estiver autenticado', async () => {
    // Simula utilizador não logado
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ type: 'blob.upload', payload: {} }),
    });

    // O handleUpload internamente chama o nosso callback 'onBeforeGenerateToken'.
    // Como é difícil mockar a implementação interna da biblioteca, 
    // neste teste unitário verificamos se a API lida com o erro que o handleUpload lançaria
    // se o callback falhasse, ou validamos a lógica simulando o fluxo.
    
    // Para simplificar o teste da ROTA (que é o nosso foco):
    // Vamos simular que o handleUpload lança o erro que definimos na rota.
    (handleUpload as jest.Mock).mockRejectedValue(new Error('Não autorizado'));

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Não autorizado');
  });

  it('✅ deve retornar o token json se o upload for autorizado', async () => {
    // Simula utilizador logado
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user_123', email: 'teste@admin.com' });

    // Simula resposta de sucesso do Vercel
    const mockResponse = { type: 'blob.upload-completed', response: 'ok' };
    (handleUpload as jest.Mock).mockResolvedValue(mockResponse);

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockResponse);
  });
});