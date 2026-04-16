'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfToday, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import GoalCard from '@/components/GoalCard';
import GoalFormModal from '@/components/GoalFormModal';
import GoalDetailModal from '@/components/GoalDetailModal';
import api from '@/lib/api';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WeekDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [anchorDate, setAnchorDate] = useState<Date>(startOfToday());
    const [tasksByDay, setTasksByDay] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    
    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<any | null>(null);
    const [formDate, setFormDate] = useState<Date>(new Date());

    // Detail Modal State
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const days = useMemo(() => {
        const monday = startOfWeek(anchorDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    }, [anchorDate]);

    const fetchWeekGoals = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const startDate = format(days[0], 'yyyy-MM-dd');
            const endDate = format(days[6], 'yyyy-MM-dd');
            const response = await api.get(`/goals?startDate=${startDate}&endDate=${endDate}`);
            setTasksByDay(response.data);
            
            // If detail modal is open, update the selected goal data
            if (isDetailOpen && selectedGoal) {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const updatedGoals = response.data[dateStr] || [];
                const updatedGoal = updatedGoals.find((g: any) => g.id === selectedGoal.id);
                if (updatedGoal) {
                    setSelectedGoal(updatedGoal);
                } else {
                    setIsDetailOpen(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch week goals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchWeekGoals(true);
        }
    }, [user, days]);

    const openCreateModal = (date: Date) => {
        setGoalToEdit(null);
        setFormDate(date);
        setIsFormOpen(true);
    };

    const handleOptimisticUpdate = (goalId: string, newSteps: number) => {
        // Update the tasks list for the day
        setTasksByDay(current => {
            const newState = { ...current };
            for (const date in newState) {
                newState[date] = newState[date].map(g => 
                    g.id === goalId ? { ...g, completedStepsToday: newSteps } : g
                );
            }
            return newState;
        });

        // Update selected goal if modal is open
        if (isDetailOpen && selectedGoal?.id === goalId) {
            setSelectedGoal((prev: any) => prev ? { ...prev, completedStepsToday: newSteps } : null);
        }
    };

    const handleGoalClick = (goal: any, date: Date) => {
        setSelectedGoal(goal);
        setSelectedDate(date);
        setIsDetailOpen(true);
    };

    const handleEditFromDetail = () => {
        setGoalToEdit(selectedGoal);
        setFormDate(selectedDate);
        setIsDetailOpen(false);
        setIsFormOpen(true);
    };

    const handlePreviousWeek = () => setAnchorDate(subWeeks(anchorDate, 1));
    const handleNextWeek = () => setAnchorDate(addWeeks(anchorDate, 1));
    const handleTodayWeek = () => setAnchorDate(startOfToday());

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse text-lg text-primary">Carregando...</div>
            </div>
        );
    }

    const today = startOfToday();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-[1600px]">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Planejador Semanal</h2>
                            <p className="text-muted-foreground">
                                {format(days[0], "d 'de' MMM", { locale: ptBR })} - {format(days[6], "d 'de' MMM, yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/50">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePreviousWeek}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" className="h-9 px-4 text-sm font-medium" onClick={handleTodayWeek}>
                            Hoje
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextWeek}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start">
                    {loading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="space-y-4 p-4 rounded-xl border bg-card/50">
                                <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                                <div className="h-24 bg-muted/50 animate-pulse rounded-lg"></div>
                            </div>
                        ))
                    ) : (
                        days.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const goalsForDay = tasksByDay[dateStr] || [];
                            const isToday = isSameDay(day, today);

                            return (
                                <div key={dateStr} className={`flex flex-col min-h-[500px] p-3 rounded-xl border transition-all duration-300 ${isToday ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-card/30 border-border hover:border-primary/20'}`}>
                                    {/* Column Header */}
                                    <div className="flex flex-col mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {format(day, 'EEE', { locale: ptBR })}
                                            </span>
                                            {isToday && (
                                                <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-bold uppercase">
                                                    Hoje
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mt-1">
                                            {format(day, 'd', { locale: ptBR })}
                                        </h3>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                            {format(day, 'MMMM', { locale: ptBR })}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        {goalsForDay.map(goal => (
                                            <GoalCard
                                                key={`${goal.id}-${dateStr}`}
                                                goal={goal}
                                                date={day}
                                                variant="compact"
                                                onClick={() => handleGoalClick(goal, day)}
                                                onUpdate={() => fetchWeekGoals(false)}
                                                onOptimisticUpdate={handleOptimisticUpdate}
                                                onEdit={() => {}} // Not used in compact variant
                                            />
                                        ))}

                                        <Button
                                            variant="ghost" 
                                            className="w-full h-10 border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all group rounded-lg mt-2"
                                            onClick={() => openCreateModal(day)}
                                        >
                                            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium">Nova</span>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            <GoalDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                goal={selectedGoal}
                date={selectedDate}
                onUpdate={() => fetchWeekGoals(false)}
                onOptimisticUpdate={handleOptimisticUpdate}
                onEdit={handleEditFromDetail}
            />


            <GoalFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => fetchWeekGoals(false)}
                goal={goalToEdit}
                defaultDate={formDate}
            />
        </div>
    );
}
