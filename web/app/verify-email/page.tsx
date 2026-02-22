'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import api from '@/lib/api';
import { translateError } from '@/lib/translations';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando seu endereço de e-mail...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Nenhum token de verificação fornecido.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await api.get(`/auth/verify?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'E-mail verificado com sucesso!');
            } catch (err: any) {
                setStatus('error');
                const apiError = err.response?.data?.error || err.message || 'Verification failed. The token may be invalid or expired.';
                setMessage(translateError(apiError));
            }
        };

        verifyToken();
    }, [token]);

    return (
        <Card className="w-full max-w-sm text-center">
            <CardHeader className="flex flex-col items-center">
                <div className="mb-4">
                    <Image src="/logo.svg" alt="Taskflow Logo" width={80} height={80} className="block dark:hidden" priority />
                    <Image src="/logo-white.svg" alt="Taskflow Logo" width={80} height={80} className="hidden dark:block" priority />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">
                    {status === 'loading' && 'Verificando...'}
                    {status === 'success' && 'Verificado!'}
                    {status === 'error' && 'Falha na Verificação'}
                </CardTitle>
                <CardDescription>
                    {message}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {status !== 'loading' && (
                    <Button className="w-full mt-4" onClick={() => router.push('/login')}>
                        Ir para o Login
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmail() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Suspense fallback={<div>Loading verify component...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
