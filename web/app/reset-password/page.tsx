'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import api from '@/lib/api';
import { translateError } from '@/lib/translations';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setStatus('error');
            setMessage('Token de redefinição inválido ou ausente.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage("As senhas não coincidem.");
            return;
        }

        if (newPassword.length < 6) {
            setStatus('error');
            setMessage("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setStatus('success');
            setMessage('A senha foi redefinida com sucesso. Você já pode entrar.');
        } catch (err: any) {
            setStatus('error');
            const apiError = err.response?.data?.error || err.message || 'Failed to reset password.';
            setMessage(translateError(apiError));
        }
    };

    if (status === 'success') {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Sucesso</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={() => router.push('/login')}>
                        Ir para o Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="space-y-1 text-center flex flex-col items-center">
                <div className="mb-4">
                    <Image src="/logo.svg" alt="Taskflow Logo" width={80} height={80} className="block dark:hidden" priority />
                    <Image src="/logo-white.svg" alt="Taskflow Logo" width={80} height={80} className="hidden dark:block" priority />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-primary">Redefinir Senha</CardTitle>
                <CardDescription>
                    Insira sua nova senha abaixo
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {status === 'error' && <div className="text-destructive text-sm font-medium">{message}</div>}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <PasswordInput
                            id="newPassword"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="mt-5">
                    <Button className="w-full" type="submit" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Redefinindo...' : 'Redefinir Senha'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function ResetPassword() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Suspense fallback={<div>Loading reset form...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
