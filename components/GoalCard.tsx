'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Check, Edit2, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

interface GoalCardProps {
    goal: {
        id: string;
        title: string;
        type: 'DAILY' | 'PUNCTUAL';
        totalSteps: number;
        completedStepsToday: number;
        time?: string;
        daysOfWeek?: string[];
    };
    date: Date;
    onUpdate: () => void;
    onEdit: () => void;
}

export default function GoalCard({ goal, date, onUpdate, onEdit }: GoalCardProps) {
    const [loading, setLoading] = useState(false);
    const isCompleted = goal.completedStepsToday >= goal.totalSteps;

    const handleStep = async (e: React.MouseEvent, delta: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setLoading(true);
            const formattedDate = format(date, 'yyyy-MM-dd');
            await api.post(`/goals/${goal.id}/log?date=${formattedDate}`, {
                stepDelta: delta
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to update goal steps', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        try {
            setLoading(true);
            await api.delete(`/goals/${goal.id}`);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete goal', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`overflow-hidden transition-all duration-300 ${isCompleted ? 'bg-primary/5 border-primary/20' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.title}
                        </h3>
                        <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {goal.type}
                        </span>
                        {goal.time && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                                <Clock className="h-3 w-3" />
                                {goal.time.substring(0, 5)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm mt-2">
                        <span className="text-muted-foreground">
                            Progress: <strong className={isCompleted ? 'text-primary' : ''}>{goal.completedStepsToday}</strong> / {goal.totalSteps}
                        </span>

                        {/* Progress Bar Mini */}
                        <div className="flex-1 h-2 bg-secondary rounded-full max-w-[100px] overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, (goal.completedStepsToday / goal.totalSteps) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-wrap justify-end sm:flex-nowrap">
                    {goal.completedStepsToday > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            disabled={loading}
                            onClick={(e) => handleStep(e, -1)}
                            title="Undo 1 step"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                    )}

                    {!isCompleted ? (
                        <Button
                            type="button"
                            variant="default"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/90 shrink-0"
                            disabled={loading}
                            onClick={(e) => handleStep(e, 1)}
                            title="Complete 1 step"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-primary/20 text-primary hover:bg-primary/30 shrink-0"
                            disabled
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    )}

                    <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit();
                        }}
                        disabled={loading}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Tarefa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta tarefa completamente? Esta ação removerá todo o histórico de progresso e não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
