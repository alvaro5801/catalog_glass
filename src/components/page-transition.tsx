// src/components/page-transition.tsx
"use client";

import { motion } from "framer-motion";

// Define as variantes da animação
const variants = {
  hidden: { opacity: 0, y: 15 }, // Estado inicial: invisível e ligeiramente abaixo
  enter: { opacity: 1, y: 0 },   // Estado final: totalmente visível na posição original
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      transition={{ ease: "easeInOut", duration: 0.5 }}
      
      // ✅ CORREÇÃO PRINCIPAL: Adicionar 'relative z-0'
      // Isto força todo o conteúdo da página a ficar na camada "0",
      // atrás do cabeçalho (que agora está na camada "30").
      className="relative z-0"
    >
      {children}
    </motion.div>
  );
}