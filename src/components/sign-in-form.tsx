// src/components/sign-in-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Importar a função de login do Auth.js
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // 1. Chamar a função signIn do Auth.js
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false, // Impedir redirecionamento automático
        });

        setIsLoading(false);

        // 2. Lidar com o resultado
        if (result?.error) {
            // A mensagem de erro padrão do Auth.js para falha de credenciais é 'CredentialsSignin'
            if (result.error.includes("CredentialsSignin")) {
                setError("E-mail ou senha inválidos. Verifique as suas credenciais.");
            } else {
                setError(result.error);
            }
        } else if (result?.ok) {
            // Sucesso!
            // Redirecionamos para o nosso porteiro /login-redirect (RF01.2, RF02.1)
            router.push('/login-redirect');
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Input 
                    id="login-email"
                    type="email" 
                    placeholder="E-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Input 
                    id="login-password"
                    type="password" 
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            
            {error && (
                <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className='text-xs'>{error}</p>
                </div>
            )}

            <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "A entrar..." : "Entrar"}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
                Esqueceu-se da senha?{' '}
                <Link href="#" className="font-medium text-primary hover:underline">
                    Recuperar
                </Link>
            </p>
        </form>
    );
}