import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import api from '@/lib/api';
import { translateError } from '@/lib/translations';

export interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [message, setMessage] = useState('');

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setStatus('idle');
        setMessage('');
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            await api.post('/auth/change-password', { currentPassword, newPassword });
            setStatus('success');
            setMessage('Senha alterada com sucesso.');
            setTimeout(() => {
                resetForm();
                onClose();
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            const apiError = err.response?.data?.error || err.message || 'Failed to change password.';
            setMessage(translateError(apiError));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                        Atualize sua senha com segurança aqui.
                    </DialogDescription>
                </DialogHeader>

                {status === 'success' ? (
                    <div className="py-4 text-center">
                        <p className="text-sm text-green-600 font-medium">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {status === 'error' && <p className="text-sm font-medium text-destructive">{message}</p>}
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <PasswordInput
                                id="currentPassword"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
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
                            <Label htmlFor="confirmPassword">Confirm Nova Senha</Label>
                            <PasswordInput
                                id="confirmPassword"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Salvando...' : 'Salvar alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
