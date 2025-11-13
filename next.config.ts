import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com', // Permite todas as imagens do Vercel Blob
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Útil para placeholders se usar
      }
    ],
  },
};

export default nextConfig;