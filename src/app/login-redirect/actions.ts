// src/app/login-redirect/actions.ts
"use server";

import { getAuthenticatedUser } from "@/lib/auth-helper";

export async function getLoginRedirectUrl(): Promise<string> {
  // 1. Verificar se está logado
  const user = await getAuthenticatedUser();
  
  if (!user || !user.email) {
    return "/"; // Se não houver user, volta para a home de vendas
  }

  // ✅ MUDANÇA: Agora redireciona SEMPRE para a Vitrine Principal (Demo)
  // Em vez de ir para a loja vazia do utilizador (`/${catalog.slug}`)
  return "/vitrine";
}