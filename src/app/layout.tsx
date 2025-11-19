import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/favorites-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Catalogg - Crie seu Catálogo Digital",
  description: "A forma mais simples de criar o seu catálogo online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Adicionei um log para confirmar se o layout está a carregar
  console.log("🏗️ [RootLayout] A renderizar a aplicação...");

  return (
    <html lang="pt">
      <body className={inter.className}>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}