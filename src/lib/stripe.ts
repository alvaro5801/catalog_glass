// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('A variável STRIPE_SECRET_KEY não está definida.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover', // ✅ Atualizado para a versão correta
  typescript: true,
});