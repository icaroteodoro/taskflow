'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Edit2, Minus, Plus, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface GoalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: any;
    date: Date;
    onUpdate: () => void;
    onEdit: () => void;
    onOptimisticUpdate?: (goalId: string, newSteps: number) => void;
}

export default function GoalDetailModal({ isOpen, onClose, goal, date, onUpdate, onEdit, onOptimisticUpdate }: GoalDetailModalProps) {
    const [loading, setLoading] = useState(false);

    if (!goal) return null;

    const isCompleted = goal.completedStepsToday >= goal.totalSteps;
    const progress = Math.min(100, Math.max(0, (goal.completedStepsToday / goal.totalSteps) * 100));

    const handleStep = async (delta: number) => {
        const newSteps = Math.min(goal.totalSteps, Math.max(0, goal.completedStepsToday + delta));

        // Optimistic update
        if (onOptimisticUpdate) {
            onOptimisticUpdate(goal.id, newSteps);
        }

        try {
            setLoading(true);
            const formattedDate = format(date, 'yyyy-MM-dd');
            await api.post(`/goals/${goal.id}/log?date=${formattedDate}`, {
                stepDelta: delta
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to update goal steps', error);
            // Revert state if error
            onUpdate();
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/goals/${goal.id}`);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to delete goal', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                <div className={`h-2 bg-primary transition-all duration-500`} style={{ width: `${progress}%` }} />
                
                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {goal.type === 'DAILY' ? 'Hábito Diário' : 'Meta Pontual'}
                            </span>
                            {isCompleted && (
                                <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Concluído
                                </span>
                            )}
                        </div>
                        <DialogTitle className="text-2xl font-bold leading-tight">
                            {goal.title}
                        </DialogTitle>
                        <DialogDescription className="flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm uppercase font-medium">
                                <Calendar className="h-4 w-4 text-primary/60" />
                                {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </span>
                            {goal.time && (
                                <span className="flex items-center gap-1.5 text-sm uppercase font-medium">
                                    <Clock className="h-4 w-4 text-primary/60" />
                                    {goal.time.substring(0, 5)}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        {/* Progress Section */}
                        <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Progresso Atual</p>
                                    <h4 className="text-3xl font-black tabular-nums">
                                        {goal.completedStepsToday} <span className="text-lg text-muted-foreground font-medium">/ {goal.totalSteps}</span>
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-primary tabular-nums">{Math.round(progress)}%</p>
                                </div>
                            </div>
                            
                            <div className="h-3 bg-background rounded-full overflow-hidden border border-border/50">
                                <div 
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="h-14 rounded-xl border-2 gap-2 font-bold"
                                onClick={() => handleStep(-1)}
                                disabled={loading || goal.completedStepsToday <= 0}
                            >
                                <Minus className="h-5 w-5" />
                                Remover Passo
                            </Button>
                            <Button 
                                variant={isCompleted ? "secondary" : "default"}
                                size="lg" 
                                className={`h-14 rounded-xl shadow-lg gap-2 font-bold transition-all ${!isCompleted ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
                                onClick={() => handleStep(1)}
                                disabled={loading || isCompleted}
                            >
                                <Plus className="h-5 w-5" />
                                {isCompleted ? 'Concluído' : 'Adicionar Passo'}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-secondary/10 p-4 border-t border-border flex flex-row items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary gap-2"
                            onClick={() => {
                                onClose();
                                onEdit();
                            }}
                            disabled={loading}
                        >
                            <Edit2 className="h-4 w-4" />
                            Editar
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive gap-2"
                                    disabled={loading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Tarefa?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação removerá todo o histórico de progresso desta tarefa. Não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Confirmar Exclusão
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
