// src/app/catalogo/__tests__/page.test.tsx
// ✅ CORREÇÃO: 'Suspense' foi removido da importação
import React from 'react'; 
// ✅ CORREÇÃO: 'waitFor' foi removido da importação
import { render, screen } from '@testing-library/react'; 
import CatalogoPage from '../page'; // Importa a tua página do catálogo

// 1. Simular o PageLayout (como nos outros testes)
jest.mock('../../page-layout', () => {
  return function MockPageLayout({ children }: { children: React.ReactNode }) {
    // Renderiza o children para que o conteúdo da página (CatalogContent) possa ser verificado
    return <div data-testid="mock-page-layout">{children}</div>;
  };
});

// 2. Simular o CatalogContent
jest.mock('../catalog-content', () => ({
  CatalogContent: () => <div data-testid="mock-catalog-content">Conteúdo do Catálogo Mock</div>,
}));

// 3. Simular dependências
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/catalogo', // Simula o pathname para esta página
  useSearchParams: () => ({ get: () => '' }),
  notFound: jest.fn(),
}));

describe('CatalogoPage Component', () => {

  it('deve renderizar o título e o componente CatalogContent dentro do PageLayout', async () => {
    render(<CatalogoPage />);

    // Verificar se o PageLayout (simulado) está presente
    expect(screen.getByTestId('mock-page-layout')).toBeInTheDocument();

    // Verificar se o título principal da página está presente
    expect(screen.getByRole('heading', { level: 1, name: /Nosso Catálogo/i })).toBeInTheDocument();

    // Esperar que o conteúdo dentro do Suspense seja renderizado
    const catalogContentMock = await screen.findByTestId('mock-catalog-content');
    expect(catalogContentMock).toBeInTheDocument();
    expect(catalogContentMock).toHaveTextContent('Conteúdo do Catálogo Mock');
  });

});