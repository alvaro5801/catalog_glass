// src/app/catalogo/[slug]/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
// ✅ CORREÇÃO: Importar 'products' diretamente, tal como a página faz
import ProductPage, { generateStaticParams } from '../page';
import { products } from '@/data/products'; // <-- Importar dados reais
// ❌ 'notFound' foi removido porque não estava a ser utilizado
// import { notFound } from 'next/navigation'; 
import type { Product } from '@/lib/types';

// Mock do ProductDetail (continua igual)
const mockProductDetail = jest.fn();
jest.mock('@/components/product-detail', () => ({
  ProductDetail: (props: { product: Product }) => { // Tipar as props esperadas
    mockProductDetail(props);
    return <div data-testid="mock-product-detail">Detalhes Mock</div>;
  },
}));

// Mock do notFound (a importação foi removida, mas o mock continua)
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => '' }), // Manter mocks relevantes
}));


describe('ProductPage (Server Component)', () => {

  beforeEach(() => {
    mockProductDetail.mockClear();
    mockNotFound.mockClear();
  });

  // Teste para generateStaticParams
  it('generateStaticParams deve retornar slugs dos produtos reais', async () => {
    const params = generateStaticParams(); // Agora usa os dados reais importados

    expect(params).toEqual(products.map(p => ({ slug: p.slug })));
  });

  it('deve buscar o produto real e renderizar ProductDetail', async () => {
    const productSlugToTest = 'copo-long-drink-personalizado'; // Usar um slug real
    const productToTest = products.find(p => p.slug === productSlugToTest);
    if (!productToTest) throw new Error(`Produto real com slug "${productSlugToTest}" não encontrado para o teste`); // Garantia

    const props = { params: { slug: productSlugToTest } };

    // Execução
    const resolvedComponent = await ProductPage(props);
    render(resolvedComponent);

    // Verificação
    expect(mockNotFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('mock-product-detail')).toBeInTheDocument();

    expect(mockProductDetail).toHaveBeenCalledWith({
       product: productToTest // Espera o objeto completo dos dados reais
    });
  });

  it('deve chamar notFound se o produto não for encontrado pelo slug nos dados reais', async () => {
     const props = { params: { slug: 'slug-nao-existe' } };

     // Execução e Verificação
     // Usamos try/catch porque notFound() interrompe a renderização.
     try {
       await ProductPage(props);
     } catch { // ✅ CORREÇÃO: Alterado de 'catch (e: any)' para 'catch'
        // É esperado que notFound() lance um erro interno específico do Next.js
     }
     expect(mockNotFound).toHaveBeenCalledTimes(1);
     expect(mockProductDetail).not.toHaveBeenCalled();
  });

});