import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com', // Permite as imagens do Vercel Blob
      },
    ],
  },
};

export default nextConfig;