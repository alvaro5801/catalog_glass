// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button'; // Aponta para o seu componente de botão

describe('Button Component', () => {
  it('deve renderizar o botão com o texto correto', () => {
    // 1. Renderiza o componente
    render(<Button>Clique-me</Button>);

    // 2. Procura por um elemento com a "role" de botão e o nome "Clique-me"
    const buttonElement = screen.getByRole('button', { name: /Clique-me/i });

    // 3. Afirma que o elemento foi encontrado no documento
    expect(buttonElement).toBeInTheDocument();
  });
});