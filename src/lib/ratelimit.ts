// src/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Verifica se as variáveis de ambiente existem
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️ Upstash Redis credentials not found. Rate limiting is disabled.");
}

// Cria uma instância do Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Cria o limitador
// Regra: Permite 5 requisições a cada 60 segundos (janela deslizante)
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true, // Opcional: para ver estatísticas no dashboard do Upstash
  prefix: "@upstash/ratelimit",
});