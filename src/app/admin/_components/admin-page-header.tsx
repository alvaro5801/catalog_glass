// src/app/admin/_components/admin-page-header.tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
import React from 'react'

/**
 * Props para o componente AdminPageHeader.
 */
interface AdminPageHeaderProps {
  /** O título principal a ser exibido (ex: "Dashboard", "Produtos") */
  title: string
  /** O texto para o item final do breadcrumb (OPCIONAL) */
  breadcrumb?: string
  /** Um "espaço" para adicionar elementos (como botões) à direita (OPCIONAL) */
  children?: React.ReactNode
}

/**
 * Um componente reutilizável para exibir o cabeçalho padrão das páginas do admin,
 * incluindo o título, breadcrumb (opcional) e ações (opcional).
 */
export default function AdminPageHeader({
  title,
  breadcrumb,
  children,
}: AdminPageHeaderProps) {
  return (
    // Este header é o da página, que rola com o conteúdo
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
      {/* Lado Esquerdo: Título e Breadcrumb */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>

        {/* Só renderiza o Breadcrumb se a prop 'breadcrumb' for fornecida */}
        {breadcrumb && (
          <Breadcrumb className="hidden md:flex mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Lado Direito: "Children" (espaço para botões) */}
      <div>{children}</div>
    </header>
  )
}