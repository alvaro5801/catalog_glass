// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';
import { axe, toHaveNoViolations } from 'jest-axe'; // 1. Importar a biblioteca axe e a extensão

// ✅ CORREÇÃO: A extensão agora é importada diretamente.
expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  it('deve renderizar o botão com o texto correto', () => {
    render(<Button>Clique-me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Clique-me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('não deve ter violações de acessibilidade', async () => {
    const { container } = render(<Button>Botão Acessível</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});