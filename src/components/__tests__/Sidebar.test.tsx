// src/components/__tests__/Sidebar.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavContent } from '../sidebar'; // Importamos NavContent, que tem a lógica

// 1. SIMULAÇÃO (MOCK) DO 'usePathname'
// Para testar o estado ativo, precisamos de controlar qual URL o componente "pensa" que está a ser acedida.
// Criamos uma função 'mock' que podemos alterar em cada teste.
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  // Sempre que o código pedir o 'usePathname', ele receberá a nossa função simulada.
  usePathname: () => mockUsePathname(),
}));

describe('Sidebar Navigation', () => {

  // Limpa o estado da simulação entre os testes para garantir a independência.
  beforeEach(() => {
    mockUsePathname.mockClear();
  });

  it('deve marcar o link "Início" como ativo na rota /admin/dashboard', () => {
    // 2. CONFIGURAÇÃO DO CENÁRIO
    // Dizemos à nossa simulação para retornar a rota do dashboard.
    mockUsePathname.mockReturnValue('/admin/dashboard');

    // Renderiza o componente com o 'pathname' simulado.
    render(<NavContent />);

    // 3. VERIFICAÇÃO DO RESULTADO
    // Encontramos o botão "Início". O 'closest' encontra o elemento 'button' pai do texto.
    const inicioButton = screen.getByText('Início').closest('button');
    // Encontramos o botão "Produtos" para garantir que ele NÃO está ativo.
    const produtosButton = screen.getByText('Produtos').closest('button');

    // Verificamos se o botão "Início" tem a classe da variante 'default' (ativo).
    expect(inicioButton).toHaveClass('bg-primary');
    // Verificamos que o botão "Produtos" NÃO tem a classe de ativo.
    expect(produtosButton).not.toHaveClass('bg-primary');
  });

  it('deve marcar o link "Produtos" como ativo na rota /admin/products', () => {
    // CONFIGURAÇÃO DO CENÁRIO
    mockUsePathname.mockReturnValue('/admin/products');
    render(<NavContent />);

    // VERIFICAÇÃO DO RESULTADO
    const inicioButton = screen.getByText('Início').closest('button');
    const produtosButton = screen.getByText('Produtos').closest('button');

    // A lógica é invertida: agora "Produtos" deve estar ativo.
    expect(produtosButton).toHaveClass('bg-primary');
    expect(inicioButton).not.toHaveClass('bg-primary');
  });

  it('não deve marcar nenhum link como ativo numa rota desconhecida', () => {
    // CONFIGURAÇÃO DO CENÁRIO
    mockUsePathname.mockReturnValue('/admin/alguma-outra-pagina');
    render(<NavContent />);

    // VERIFICAÇÃO DO RESULTADO
    const inicioButton = screen.getByText('Início').closest('button');
    const produtosButton = screen.getByText('Produtos').closest('button');

    // Nenhum dos botões deve ter a classe de ativo.
    expect(inicioButton).not.toHaveClass('bg-primary');
    expect(produtosButton).not.toHaveClass('bg-primary');
  });
});