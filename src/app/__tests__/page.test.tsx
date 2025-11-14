// src/app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

// ✅ CORREÇÃO: Usar o alias '@' em vez de '../' resolve o erro de caminho
import Home from '@/app/page'; 

// 1. Mock do PageLayout
jest.mock('@/app/page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="page-layout">{children}</div>;
  };
});

// 2. Mock do next/link
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: { href: string, children: React.ReactNode }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Home Page (SaaS Landing Page)', () => {

  it('deve renderizar a secção Hero com o título e o CTA principal', () => {
    render(<Home />);

    // Verifica o título principal (H1)
    expect(screen.getByRole('heading', { 
      name: /Crie um catálogo online profissional em menos de 5 minutos/i 
    })).toBeInTheDocument();

    // Verifica a descrição do Hero
    expect(screen.getByText(/Diga adeus aos PDFs desatualizados/i)).toBeInTheDocument();

    // Verifica o botão de CTA principal (Call to Action)
    const ctaButton = screen.getByRole('link', { name: /Criar Meu Catálogo Grátis/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/signup');
  });

  it('deve renderizar a secção de Prova Social', () => {
    render(<Home />);

    expect(screen.getByText(/Junte-se a centenas de empreendedores/i)).toBeInTheDocument();
    // Verifica se alguns dos "Logos" falsos estão presentes
    expect(screen.getByText('Doce Sabor Confeitaria')).toBeInTheDocument();
    expect(screen.getByText('Ateliê Criativo')).toBeInTheDocument();
  });

  it('deve renderizar a secção de Funcionalidades', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Tudo o que precisa para vender mais/i })).toBeInTheDocument();

    // Verifica se os textos das funcionalidades estão presentes
    expect(screen.getByText(/Editor Simples/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Responsivo/i)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp Integrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Link Único/i)).toBeInTheDocument();
  });

  it('deve renderizar a chamada final para ação (Footer CTA)', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Pronto para criar o seu catálogo\?/i })).toBeInTheDocument();
    
    // Verifica o botão final "Começar Agora"
    const finalCta = screen.getByRole('link', { name: /Começar Agora/i });
    expect(finalCta).toBeInTheDocument();
    expect(finalCta).toHaveAttribute('href', '/signup');
  });
});