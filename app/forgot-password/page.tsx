'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { translateError } from '@/lib/translations';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(res.data.message || "Se a conta existir, um e-mail de redefinição de senha foi enviado.");
        } catch (err: any) {
            setStatus('error');
            const apiError = err.response?.data?.error || err.message || 'Failed to request password reset.';
            setMessage(translateError(apiError));
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
                        Insira seu e-mail para redefinir sua senha
                    </CardDescription>
                </CardHeader>
                {status === 'success' ? (
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-6">
                            {message}
                        </p>
                        <Link href="/login" className="font-semibold text-primary hover:underline text-sm">
                            Voltar ao login
                        </Link>
                    </CardContent>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {status === 'error' && <div className="text-destructive text-sm font-medium">{message}</div>}
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
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 mt-5">
                            <Button className="w-full" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Enviando...' : 'Enviar Link de Redefinição'}
                            </Button>
                            <div className="text-center text-sm">
                                Lembrou da sua senha?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:underline">
                                    Entrar
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
