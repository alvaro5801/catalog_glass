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
      transition={{ ease: "easeInOut", duration: 0.5 }} // Define a suavidade e duração
    >
      {children}
    </motion.div>
  );
}