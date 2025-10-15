// src/components/__tests__/ProductDetail.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetail } from '../product-detail';
import { products } from '@/data/products';

describe('ProductDetail Component', () => {
  it('deve atualizar a imagem principal ao clicar numa miniatura', () => {
    // 1. ✅ CORREÇÃO: A lógica de encontrar o produto fica DENTRO do teste.
    const productWithMultipleImages = products.find(p => p.images.length > 1);

    // 2. ✅ BOA PRÁTICA: Uma verificação garante que temos dados de teste válidos.
    if (!productWithMultipleImages) {
      throw new Error("Dados de teste em falta: Nenhum produto com múltiplas imagens foi encontrado em products.ts.");
    }

    render(<ProductDetail product={productWithMultipleImages} />);

    // Encontra a imagem principal
    const mainImage = screen.getByAltText(productWithMultipleImages.name);
    
    // Verifica se a imagem inicial está correta
    expect(mainImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(productWithMultipleImages.images[0])));

    // Encontra a segunda miniatura pelo seu 'alt' text único e numerado
    const secondThumbnail = screen.getByAltText(`${productWithMultipleImages.name} thumbnail 2`);
    
    // Clica na miniatura
    fireEvent.click(secondThumbnail);

    // Verifica se a imagem principal foi atualizada
    expect(mainImage).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(productWithMultipleImages.images[1])));
  });
});