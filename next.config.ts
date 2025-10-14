// next.config.js

/**
 * Documentação do JSDoc
 * Este comentário especial diz ao editor de código (e ao TypeScript)
 * para verificar este objeto de configuração contra o tipo `NextConfig`
 * que vem do pacote 'next'. Isto dá-nos segurança de tipos sem um ficheiro .ts.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // ✅ Usa o modo "strict" do React (recomendado em desenvolvimento)
  reactStrictMode: true,

  // ✅ Habilita compressão Gzip/Brotli para melhorar performance
  compress: true,

  // ✅ Define comportamento do App Router (Next 15)
  experimental: {
    typedRoutes: true, // verifica rotas tipadas em tempo de compilação
    optimizePackageImports: ["lucide-react", "date-fns", "lodash"], // otimiza imports comuns
  },

  // ✅ Configuração de imagens remotas (se usar next/image)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },

  // ✅ Opção útil para ambientes de CI/CD (como Vercel)
  eslint: {
    // Permite que o build prossiga mesmo com erros de lint (opcional)
    ignoreDuringBuilds: true,
  },

  // ✅ Ativa o SWC minifier (compilador nativo do Next)
  swcMinify: true,

  // ✅ (Opcional) Define variáveis públicas do app
  env: {
    NEXT_PUBLIC_APP_NAME: "Catalog Glass",
    NEXT_PUBLIC_API_URL: "https://api.example.com",
  },
};

// Em ficheiros .js, usamos `module.exports` em vez de `export default`
module.exports = nextConfig;