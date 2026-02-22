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

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            // Redirect handled by context
        } catch (err: any) {
            const apiError = err.response?.data?.error || err.message || 'Login failed. Please try again.';
            setError(translateError(apiError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center flex flex-col items-center">
                    <div className="mb-4">
                        <Image src="/logo.svg" alt="Taskflow Logo" width={80} height={80} className="block dark:hidden" priority />
                        <Image src="/logo-white.svg" alt="Taskflow Logo" width={80} height={80} className="hidden dark:block" priority />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Taskflow</CardTitle>
                    <CardDescription>
                        Insira seu e-mail e senha para entrar
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <div className="text-destructive text-sm font-medium">{error}</div>}
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                            </div>
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline" tabIndex={-1}>
                                Esqueceu a senha?
                            </Link>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-5">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <div className="text-center text-sm">
                            Ainda não tem uma conta?{' '}
                            <Link href="/register" className="font-semibold text-primary hover:underline">
                                Criar conta
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
