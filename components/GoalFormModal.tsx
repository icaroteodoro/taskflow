'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import api from '@/lib/api';

interface GoalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal?: any; // If editing, passing the goal object
}

export default function GoalFormModal({ isOpen, onClose, onSuccess, goal }: GoalFormModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'DAILY' | 'PUNCTUAL'>('DAILY');
    const [totalSteps, setTotalSteps] = useState(1);
    const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const DAYS = [
        { value: 'MONDAY', label: 'Seg' },
        { value: 'TUESDAY', label: 'Ter' },
        { value: 'WEDNESDAY', label: 'Qua' },
        { value: 'THURSDAY', label: 'Qui' },
        { value: 'FRIDAY', label: 'Sex' },
        { value: 'SATURDAY', label: 'Sáb' },
        { value: 'SUNDAY', label: 'Dom' },
    ];

    useEffect(() => {
        if (isOpen) {
            if (goal) {
                setTitle(goal.title);
                setType(goal.type);
                setTotalSteps(goal.totalSteps);
                setTargetDate(goal.targetDate || format(new Date(), 'yyyy-MM-dd'));
                setTime(goal.time || '');
                setDaysOfWeek(goal.daysOfWeek || []);
            } else {
                setTitle('');
                setType('DAILY');
                setTotalSteps(1);
                setTargetDate(format(new Date(), 'yyyy-MM-dd'));
                setTime('');
                setDaysOfWeek([]);
            }
            setError('');
        }
    }, [isOpen, goal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            title,
            type,
            totalSteps: Number(totalSteps),
            targetDate: type === 'PUNCTUAL' ? targetDate : null,
            time: time || null,
            daysOfWeek: type === 'DAILY' ? daysOfWeek : []
        };

        try {
            if (goal) {
                await api.put(`/goals/${goal.id}`, payload);
            } else {
                await api.post('/goals', payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{goal ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
                    <DialogDescription>
                        {goal ? 'Atualize os detalhes da sua tarefa abaixo.' : 'Adicione uma nova tarefa para acompanhar diariamente ou em uma data específica.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {error && <div className="text-destructive text-sm font-medium">{error}</div>}

                    <div className="space-y-2">
                        <Label htmlFor="title">Título da Tarefa</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Beber 3 copos de água"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Tarefa Pontual</Label>
                            <p className="text-sm text-muted-foreground">Esta tarefa está vinculada a uma data específica em vez de ser diária?</p>
                        </div>
                        <Switch
                            checked={type === 'PUNCTUAL'}
                            onCheckedChange={checked => setType(checked ? 'PUNCTUAL' : 'DAILY')}
                        />
                    </div>

                    {type === 'PUNCTUAL' && (
                        <div className="space-y-2">
                            <Label htmlFor="targetDate">Data Alvo</Label>
                            <Input
                                id="targetDate"
                                type="date"
                                required={type === 'PUNCTUAL'}
                                value={targetDate}
                                onChange={e => setTargetDate(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="time">Horário (Opcional)</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                        />
                    </div>

                    {type === 'DAILY' && (
                        <div className="space-y-2">
                            <Label>Dias da Semana (Opcional)</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {DAYS.map(day => {
                                    const isSelected = daysOfWeek.includes(day.value);
                                    return (
                                        <button
                                            type="button"
                                            key={day.value}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setDaysOfWeek(daysOfWeek.filter(d => d !== day.value));
                                                } else {
                                                    setDaysOfWeek([...daysOfWeek, day.value]);
                                                }
                                            }}
                                            className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background text-foreground border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Se nenhum dia for selecionado, a tarefa se repetirá todos os dias.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="totalSteps">Total de Passos Restantes</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="totalSteps"
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={totalSteps}
                                onChange={e => setTotalSteps(Number(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">Quantas ações concluem esta tarefa?</span>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Tarefa'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
