// src/app/admin/settings/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsPage from '../page'; // O componente que vamos testar

describe('SettingsPage', () => {

  it('deve renderizar os títulos e textos de placeholder corretamente', () => {
    render(<SettingsPage />);

    // 1. Verifica o título principal da página
    expect(screen.getByRole('heading', { 
      name: /Configurações/i, 
      level: 2 // O <h2>
    })).toBeInTheDocument();

    // 2. Verifica o card "Configurações da Conta"
    expect(screen.getByRole('heading', { 
      name: /Configurações da Conta/i, 
      level: 3 // O <h3>
    })).toBeInTheDocument();
    
    expect(screen.getByText(/Formulários para alterar o nome do negócio/i)).toBeInTheDocument();

    // 3. Verifica o card "Configurações do Catálogo"
    expect(screen.getByRole('heading', { 
      name: /Configurações do Catálogo/i, 
      level: 3 // O <h3>
    })).toBeInTheDocument();
    
    expect(screen.getByText(/Opções para personalizar a aparência/i)).toBeInTheDocument();
  });
});