// src/app/page-layout.tsx (NOVO FICHEIRO)
"use client";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { WhatsAppButton } from "../components/whatsapp-button";
import { PageTransition } from "../components/page-transition";

export default function PageLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <>
            <Header />
            <PageTransition>
            <main className="flex-grow">{children}</main>
            </PageTransition>
            <Footer />
            <WhatsAppButton />
        </>
    )
  }