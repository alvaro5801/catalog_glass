# 📦 Catalogg - Plataforma SaaS de Catálogos Digitais

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-green)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-cyan)

O **Catalogg** é uma plataforma SaaS (Software as a Service) moderna que permite a pequenos e médios negócios criar, gerir e partilhar catálogos digitais interativos em minutos. O foco principal é substituir PDFs estáticos por uma vitrine responsiva que se integra diretamente com o WhatsApp para fechar vendas.

---

## 🚀 Funcionalidades Principais

### 🛍️ Para o Cliente Final (Vitrine)
- **Catálogo Interativo:** Navegação fluida por categorias e produtos.
- **Design Responsivo:** Otimizado para telemóvel e desktop.
- **Favoritos:** Funcionalidade local para guardar produtos de interesse.
- **Integração WhatsApp:** Botão flutuante e em cada produto para iniciar conversas de venda pré-preenchidas.
- **Pesquisa e Filtros:** Filtragem dinâmica de produtos por categorias.

### 🏢 Para o Lojista (Painel Administrativo)
- **Dashboard Intuitivo:** Visão geral de métricas (total de produtos, categorias).
- **Gestão de Produtos:** CRUD completo com upload de imagens (Vercel Blob), variantes de preço e especificações técnicas.
- **Gestão de Categorias:** Organização flexível do catálogo.
- **Onboarding Wizard:** Passo a passo guiado para novos utilizadores configurarem a loja.
- **Configurações:** Personalização da loja (slug, dados da empresa).

### 🔐 Segurança e Autenticação
- **Autenticação Robusta:** Sistema híbrido com Email/Password e Magic Links (verificação de e-mail).
- **Proteção de Rotas:** Middleware para proteção de áreas administrativas.
- **Rate Limiting:** Proteção contra ataques de força bruta usando Upstash Redis.
- **Recuperação de Senha:** Fluxo completo de "Esqueci a senha" com tokens seguros.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando as melhores práticas de desenvolvimento web moderno e padrões de arquitetura limpa.

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Server Components).
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/).
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/) (Radix UI).
- **Base de Dados:** [PostgreSQL](https://www.postgresql.org/) (hospedado no Neon/Vercel).
- **ORM:** [Prisma](https://www.prisma.io/).
- **Autenticação:** [NextAuth.js v4](https://next-auth.js.org/) (com adaptador Prisma).
- **Uploads:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).
- **Pagamentos:** Integração preparada com [Stripe](https://stripe.com/) (Webhooks configurados).
- **Testes:** Jest e React Testing Library.
- **Cache/Rate Limit:** Upstash Redis.

---

## Hz Arquitetura do Projeto

Este projeto segue princípios de **Clean Architecture** e **Domain-Driven Design (DDD)** simplificado para garantir escalabilidade e facilidade de manutenção. A lógica de negócio está desacoplada da framework.
