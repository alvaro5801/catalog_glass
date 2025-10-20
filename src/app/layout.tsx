import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/favorites-context"; // 1. Importar o Provedor

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Printa Copos - Catálogo de Copos Personalizados",
  description: "Os melhores copos e taças personalizadas para o seu evento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {/* 2. Envolver toda a aplicação com o Provedor de Favoritos */}
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}
