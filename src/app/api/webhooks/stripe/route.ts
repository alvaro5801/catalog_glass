// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text(); // Lemos o corpo como texto bruto (raw) para a validação
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    // 🔐 VALIDAÇÃO DE SEGURANÇA (RNF02.4)
    // Verifica se o pedido vem mesmo da Stripe usando a chave secreta e a assinatura.
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET não configurado.');
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`⚠️  Webhook signature verification failed.`, error);
    return new NextResponse('Webhook Error: Assinatura inválida.', { status: 400 });
  }

  // Se chegámos aqui, o evento é legítimo!
  // Agora podemos processar os diferentes tipos de eventos.

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log('💰 Pagamento recebido!', checkoutSession.id);
        // AQUI: Adicionar lógica para atualizar o utilizador na BD para "Pro"
        // ex: await updateUserPlan(checkoutSession.client_reference_id, 'pro');
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Assinatura cancelada.', subscription.id);
        // AQUI: Adicionar lógica para remover acesso "Pro"
        break;

      default:
        console.log(`🤷‍♂️ Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error('Erro ao processar evento de webhook:', error);
    return new NextResponse('Erro interno ao processar evento.', { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}