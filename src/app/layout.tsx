// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Usaremos a fonte Inter para um look mais moderno
import "./globals.css";
import { Header } from "../components/header"; // Importe o Header com caminho relativo
import { Footer } from "../components/footer"; // Importe o Footer com caminho relativo

import { WhatsAppButton } from "../components/whatsapp-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Catálogo de Copos Personalizados",
  description: "Os melhores copos e taças personalizadas para o seu evento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}