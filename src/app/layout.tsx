// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { WhatsAppButton } from "../components/whatsapp-button";
import { PageTransition } from "../components/page-transition";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Regular, Semi-Bold, Bold
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
        <Header />
        <PageTransition>
          <main className="flex-grow">{children}</main>
        </PageTransition>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}