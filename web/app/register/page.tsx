'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { translateError } from '@/lib/translations';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            setIsSuccess(true);
        } catch (err: any) {
            const apiError = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setError(translateError(apiError));
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-primary">Verifique seu E-mail</CardTitle>
                        <CardDescription>
                            Enviamos um link de verificação para <strong>{email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Por favor, verifique sua caixa de entrada e clique no link para verificar sua conta antes de entrar.
                        </p>
                        <Button className="w-full" onClick={() => router.push('/login')}>
                            Ir para o Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center flex flex-col items-center">
                    <div className="mb-4">
                        <Image src="/logo.svg" alt="Taskflow Logo" width={80} height={80} className="block dark:hidden" priority />
                        <Image src="/logo-white.svg" alt="Taskflow Logo" width={80} height={80} className="hidden dark:block" priority />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Junte-se ao Taskflow</CardTitle>
                    <CardDescription>
                        Crie uma conta para começar a rastrear suas metas
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <div className="text-destructive text-sm font-medium">{error}</div>}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-5">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                        <div className="text-center text-sm">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Entrar
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
