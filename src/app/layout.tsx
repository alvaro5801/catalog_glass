// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { WhatsAppButton } from "../components/whatsapp-button";
import { PageTransition } from "../components/page-transition"; // 1. Importe o novo componente

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
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        {/* 2. Envolva o conteúdo principal com o componente de transição */}
        <PageTransition>
          <main className="flex-grow">{children}</main>
        </PageTransition>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}