// src/components/__tests__/ProductDetail.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetail } from '../product-detail';
import type { Product } from '@/lib/types'; // ✅ 1. Importar o nosso tipo de dados do frontend

describe('ProductDetail Component', () => {
  it('deve atualizar a imagem principal ao clicar numa miniatura', () => {
    // ✅ 2. Criar dados de teste locais em vez de importar.
    const productWithMultipleImages: Product = {
      id: 'prod_multi_img_123',
      slug: 'produto-multiplas-imagens',
      name: 'Produto com Várias Imagens',
      images: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],
      category: 'Testes',
      shortDescription: 'Descrição curta.',
      description: 'Descrição longa.',
      specifications: { material: 'Teste', capacidade: '100ml', dimensoes: '10x10' },
      priceTable: [{ quantity: '1', price: 10 }],
      priceInfo: 'Preço de teste.',
    };

    render(<ProductDetail product={productWithMultipleImages} />);

    const mainImage = screen.getByAltText(productWithMultipleImages.name);

    expect(mainImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(productWithMultipleImages.images[0])));

    const secondThumbnail = screen.getByAltText(`${productWithMultipleImages.name} thumbnail 2`);

    fireEvent.click(secondThumbnail);

    expect(mainImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(productWithMultipleImages.images[1])));
  });
});