// src/components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LayoutDashboard, Package, FolderKanban, Settings } from "lucide-react";

// Define a estrutura de cada link da navegação
const navLinks = [
  { href: "/admin/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/categories", label: "Categorias", icon: FolderKanban },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

// Este componente interno renderiza a lista de links
// Será usado tanto na barra lateral visível como no menu "hambúrguer"
export function NavContent() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

// Este é o componente principal da Sidebar
export function Sidebar() {
  return (
    // Em ecrãs pequenos (hidden), a barra lateral fica escondida
    // Em ecrãs médios ou maiores (md:block), ela aparece
    <aside className="hidden md:block w-64 border-r bg-background">
      <NavContent />
    </aside>
  );
}