// src/components/whatsapp-button.tsx
"use client";
import { MessageCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"; // Importe os componentes do Tooltip

export function WhatsAppButton() {
  const whatsappNumber = "SEUNUMERODEWHATSAPP"; // Ex: 5581999998888
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá!%20Vi%20o%20site%20e%20gostaria%20de%20mais%20informações.`;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 "
            aria-label="Contactar via WhatsApp"
          >
            <MessageCircle className="h-8 w-8" />
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fale Conosco!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}