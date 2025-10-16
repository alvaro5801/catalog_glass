// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';
import { axe } from 'jest-axe'; // 1. Importar a biblioteca axe

// É uma boa prática estender o 'expect' do Jest para que ele entenda a nova verificação
// Isto melhora as mensagens de erro caso um teste de acessibilidade falhe.
expect.extend(require('jest-axe').toHaveNoViolations);

describe('Button Component', () => {
  it('deve renderizar o botão com o texto correto', () => {
    render(<Button>Clique-me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Clique-me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  // ✅ NOVO TESTE DE ACESSIBILIDADE ADICIONADO AQUI
  it('não deve ter violações de acessibilidade', async () => {
    // 1. Renderizamos o componente que queremos testar.
    // A função 'render' retorna, entre outras coisas, o 'container' do nosso componente.
    const { container } = render(<Button>Botão Acessível</Button>);

    // 2. Passamos o 'container' para a função 'axe'.
    // Ela vai analisar o HTML renderizado em busca de problemas.
    const results = await axe(container);

    // 3. Esta é a asserção mágica.
    // Ela verifica se 'results' não contém nenhuma violação de acessibilidade.
    // Se encontrar algum problema, o teste falhará com uma descrição clara do que corrigir.
    expect(results).toHaveNoViolations();
  });
});