// src/app/(auth)/layout.tsx
import { AuthHeader } from "@/components/auth-header"; // Importar o novo cabeçalho

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader /> {/* Adicionar o cabeçalho aqui */}
      <main>{children}</main> {/* Envolver o conteúdo com <main> */}
    </>
  );
}