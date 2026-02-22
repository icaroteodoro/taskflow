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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
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
      fetchGoals();
    }
  }, [user, currentDate]);

  const handlePreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const openCreateModal = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Taskflow Logo" width={32} height={32} className="block dark:hidden" priority />
            <Image src="/logo-white.svg" alt="Taskflow Logo" width={32} height={32} className="hidden dark:block" priority />
            <h1 className="text-xl font-bold dark:text-white text-primary hidden sm:block">Taskflow</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto rounded-full p-1 pr-3 bg-secondary/80 hover:bg-secondary border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white font-bold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-foreground/70" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)} className="cursor-pointer flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Alterar Senha</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>Tema</span>
                  </div>
                  <Switch checked={theme === 'dark'} />
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center min-w-[140px]">
              <h2 className="text-xl font-semibold capitalize">
                {isToday ? 'Hoje' : format(currentDate, "d 'de' MMM, yyyy", { locale: ptBR })}
              </h2>
              {!isToday && (
                <button onClick={handleToday} className="text-xs text-primary hover:underline mt-1">
                  Ir para hoje
                </button>
              )}
            </div>

            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Meta
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
            <p className="text-muted-foreground mb-4">Nenhuma meta para este dia.</p>
            <Button onClick={openCreateModal} variant="outline">Crie sua primeira meta</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                date={currentDate}
                onUpdate={fetchGoals}
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
        onSuccess={fetchGoals}
        goal={goalToEdit}
      />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}
