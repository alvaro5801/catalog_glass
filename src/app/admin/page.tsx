// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

// A função desta página agora é ser o ponto de entrada padrão do admin.
export default function AdminRootPage() {
  // Redireciona qualquer acesso a /admin para /admin/dashboard
  redirect('/admin/dashboard');
}