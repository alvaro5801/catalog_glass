// src/app/api/webhooks/stripe/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe'; // O nosso cliente stripe real (que será mockado)
import { headers } from 'next/headers';

// --- MOCKS ---

// 1. Mock do Stripe (para não chamar a API real da Stripe)
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// 2. Mock dos Headers do Next.js
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('API Route: /api/webhooks/stripe', () => {
  const mockHeaders = new Map();
  const MOCK_SECRET = 'whsec_test_secret';
  
  // Guardar o ambiente original para restaurar depois
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Simular a variável de ambiente necessária
    process.env = { ...originalEnv, STRIPE_WEBHOOK_SECRET: MOCK_SECRET };
    
    // Configurar o mock dos headers para devolver o que colocamos no Map
    (headers as jest.Mock).mockResolvedValue({
        get: (key: string) => mockHeaders.get(key),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // 🛡️ TESTE 1: SEGURANÇA (Assinatura Inválida)
  it('🚫 deve retornar 400 se a assinatura (Stripe-Signature) for inválida', async () => {
    // Preparação
    mockHeaders.set('Stripe-Signature', 'assinatura_falsa');
    
    // O construtor de eventos deve lançar um erro se a assinatura falhar
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
    });

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: 'conteudo_raw_do_webhook',
    });

    // Execução
    const res = await POST(req);
    
    // Verificação
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Webhook Error: Assinatura inválida.');
  });

  // 💰 TESTE 2: SUCESSO (Pagamento Recebido)
  it('✅ deve processar checkout.session.completed com sucesso (200)', async () => {
     // Preparação
     mockHeaders.set('Stripe-Signature', 'assinatura_valida');

     const mockEvent = {
         type: 'checkout.session.completed',
         data: {
             object: { id: 'cs_test_123', client_reference_id: 'user_123' }
         }
     };
     
     // O construtor deve retornar o evento com sucesso
     (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

     // Espiar o console.log para confirmar que o nosso código correu
     const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

     const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
    });

    // Execução
    const res = await POST(req);

    // Verificação
    expect(res.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalledWith('💰 Pagamento recebido!', 'cs_test_123');
    
    consoleSpy.mockRestore(); // Limpar o espião
  });

  // 🤷‍♂️ TESTE 3: SUCESSO (Evento Ignorado)
  it('✅ deve retornar 200 mesmo para eventos não tratados (para a Stripe não reenviar)', async () => {
      mockHeaders.set('Stripe-Signature', 'assinatura_valida');
      
      const mockEvent = { type: 'evento.desconhecido', data: { object: {} } };
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalledWith('🤷‍♂️ Evento não tratado: evento.desconhecido');
    
    consoleSpy.mockRestore();
  });

   // 💥 TESTE 4: ERRO INTERNO
   it('🚫 deve retornar 500 se ocorrer um erro no processamento lógico', async () => {
      mockHeaders.set('Stripe-Signature', 'assinatura_valida');
      
      // Simular um evento malformado que fará o código falhar ao tentar ler 'object'
      // Isto força o bloco 'catch' interno a ser executado
      const mockEvent = { type: 'checkout.session.completed' }; // falta o data.object
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

      // Silenciar o erro no console durante o teste
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
    });

    const res = await POST(req);
    
    expect(res.status).toBe(500);
    expect(await res.text()).toBe('Erro interno ao processar evento.');
    
    consoleErrorSpy.mockRestore();
   });
});