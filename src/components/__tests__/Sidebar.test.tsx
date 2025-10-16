// src/components/__tests__/Sidebar.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NavContent } from '../sidebar';
import { axe, toHaveNoViolations } from 'jest-axe'; // ✅ CORREÇÃO: Importamos 'toHaveNoViolations' diretamente.

expect.extend(toHaveNoViolations); // ✅ CORREÇÃO: Usamos a variável importada.

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Sidebar Navigation', () => {

  beforeEach(() => {
    mockUsePathname.mockClear();
  });

  it('deve marcar o link "Início" como ativo na rota /admin/dashboard', async () => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    render(<NavContent />);

    await waitFor(() => {
      const inicioButton = screen.getByText('Início').closest('button');
      const produtosButton = screen.getByText('Produtos').closest('button');

      expect(inicioButton).toHaveClass('bg-primary');
      expect(produtosButton).not.toHaveClass('bg-primary');
    });
  });

  it('deve marcar o link "Produtos" como ativo na rota /admin/products', async () => {
    mockUsePathname.mockReturnValue('/admin/products');
    render(<NavContent />);

    await waitFor(() => {
      const produtosButton = screen.getByText('Produtos').closest('button');
      const inicioButton = screen.getByText('Início').closest('button');

      expect(produtosButton).toHaveClass('bg-primary');
      expect(inicioButton).not.toHaveClass('bg-primary');
    });
  });

  it('não deve marcar nenhum link como ativo numa rota desconhecida', async () => {
    mockUsePathname.mockReturnValue('/admin/alguma-outra-pagina');
    render(<NavContent />);

    await waitFor(() => {
      const inicioButton = screen.getByText('Início').closest('button');
      const produtosButton = screen.getByText('Produtos').closest('button');

      expect(inicioButton).not.toHaveClass('bg-primary');
      expect(produtosButton).not.toHaveClass('bg-primary');
    });
  });

  it('não deve ter violações de acessibilidade', async () => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    const { container } = render(<NavContent />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});