// src/app/saas/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SaasLandingPage from '../page'; // Importa a tua landing page

// Simular dependências comuns para evitar erros

// Simular o PageLayout (como fizemos no teste da Home)
jest.mock('../../page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    // Renderiza o children para que o conteúdo da página seja testável
    return <div>{children}</div>;
  };
});

// Simular o next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/saas', // Simula o pathname para esta página
  useSearchParams: () => ({ get: () => '' }),
  notFound: jest.fn(), // Incluir notFound para consistência
}));

// Simular o next/image para evitar erros de configuração de imagem nos testes
jest.mock('next/image', () => ({
  __esModule: true,
  // ✅ CORREÇÃO 1: Trocado o tipo por um mais seguro que 'any'
  default: (props: React.ComponentProps<'img'>) => { 
    // ✅ CORREÇÃO 2 e 3: O comentário 'disable' foi movido para a linha
    // imediatamente acima do 'img' para funcionar corretamente.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />; 
  },
}));

describe('SaasLandingPage Component', () => {

  it('deve renderizar os títulos principais das secções', () => {
    render(<SaasLandingPage />);

    // Verificar título da secção Herói
    expect(screen.getByRole('heading', { level: 1, name: /Crie um catálogo online profissional/i })).toBeInTheDocument();

    // Verificar título da secção Problema/Solução
    expect(screen.getByRole('heading', { name: /Ainda preso aos catálogos do passado/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dê as boas-vindas ao seu novo assistente de vendas/i })).toBeInTheDocument();

    // Verificar título da secção Funcionalidades
    expect(screen.getByRole('heading', { name: /Tudo o que precisa para um catálogo que vende por si/i })).toBeInTheDocument();

     // Verificar título da secção Como Funciona
     expect(screen.getByRole('heading', { name: /Pronto para ter o seu catálogo em 3 simples passos/i })).toBeInTheDocument();

    // Verificar título da secção Preços
    expect(screen.getByRole('heading', { name: /Escolha o plano que cresce consigo/i })).toBeInTheDocument();

    // Verificar título da secção CTA Final
    expect(screen.getByRole('heading', { name: /Pronto para ter uma vitrine digital que trabalha por si/i })).toBeInTheDocument();
  });

  it('deve renderizar os botões principais de Call to Action (CTA)', () => {
    render(<SaasLandingPage />);

    const ctaButtons = screen.getAllByRole('link', { name: /Criar .* Catálogo Grátis/i });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(2); // Deve encontrar 2

    // Verificar se apontam para o signup
    ctaButtons.forEach(button => {
        expect(button).toHaveAttribute('href', '/signup');
    });

    // Verificar botão "Começar Gratuitamente" na secção de preços
    expect(screen.getByRole('link', { name: /Começar Gratuitamente/i })).toHaveAttribute('href', '/signup');

    // Verificar botão "Escolher Plano Pro"
    expect(screen.getByRole('link', { name: /Escolher Plano Pro/i })).toHaveAttribute('href', '/signup-pro');
  });

  // Teste opcional para verificar alguns elementos específicos
  it('deve renderizar elementos específicos das secções', () => {
    render(<SaasLandingPage />);

    expect(screen.getByRole('heading', { level: 4, name: /PDFs desatualizados/i })).toBeInTheDocument();

    // Verificar uma funcionalidade em destaque
    expect(screen.getByText(/Editor Super Simples/i)).toBeInTheDocument();

    // Verificar um dos passos de "Como Funciona"
    expect(screen.getByText(/Partilhe e Comece a Vender!/i)).toBeInTheDocument();
  });

});