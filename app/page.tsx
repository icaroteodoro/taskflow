'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LogOut, Plus, ChevronDown, Settings, Moon, Sun } from 'lucide-react';
import GoalCard from '@/components/GoalCard';
import api from '@/lib/api';
import GoalFormModal from '@/components/GoalFormModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import Header from '@/components/Header';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchGoals = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const response = await api.get(`/goals?date=${formattedDate}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals(true);
    }
  }, [user, currentDate]);

  const handlePreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const openCreateModal = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const handleOptimisticUpdate = (goalId: string, newSteps: number) => {
    setGoals(currentGoals => 
      currentGoals.map(g => 
        g.id === goalId ? { ...g, completedStepsToday: newSteps } : g
      )
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg text-primary">Carregando...</div>
      </div>
    );
  }

  const isToday = isSameDay(currentDate, new Date());

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />


      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Date Navigator */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="outline" size="icon" onClick={handlePreviousDay} className="shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center flex-1 sm:flex-none sm:w-[280px] md:w-[320px] px-2 min-h-16 justify-center">
              <h2 className="text-[1rem] sm:text-lg md:text-xl font-semibold capitalize text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {isToday
                   ? `Hoje (${format(currentDate, "EEEE", { locale: ptBR })})`
                   : format(currentDate, "EEEE, d ' de' MMM, yyyy", { locale: ptBR })}
              </h2>
              {!isToday && (
                <button onClick={handleToday} className="text-xs text-primary hover:underline mt-1 h-4 flex items-center">
                  Ir para hoje
                </button>
              )}
              {isToday && (
                <div className="h-4 mt-1"></div>
              )}
            </div>

            <Button variant="outline" size="icon" onClick={handleNextDay} className="shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-card animate-pulse rounded-lg border"></div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">Nenhuma tarefa para este dia.</p>
            <Button onClick={openCreateModal} variant="outline">Crie sua primeira tarefa</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                date={currentDate}
                onUpdate={() => fetchGoals(false)}
                onOptimisticUpdate={handleOptimisticUpdate}
                onEdit={() => {
                  setGoalToEdit(goal);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>


      <GoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchGoals(false)}
        goal={goalToEdit}
        defaultDate={currentDate}
      />
    </div>
  );
}
