// src/components/auth-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

type Props = {
  children?: React.ReactNode;
};

// Este componente permite que o SessionProvider (que é um 'use client')
// envolva os nossos Server Components no layout.
export const AuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};