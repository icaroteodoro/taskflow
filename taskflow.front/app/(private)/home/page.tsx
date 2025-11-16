'use client';
import React, { useState, useEffect } from 'react';
// --- MODIFICAÇÃO 1: Importar CalendarIcon ---
import { Bell, Plus, ChevronLeft, ChevronRight, Eye, IceCreamCone, CalendarIcon } from 'lucide-react';
// Importar date-fns para formatação
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  CreateTaskRequest,
  Occurrence,
  Task,
  createTask,
  getTasksByDay,
  toggleTask,
  getTaskById,
} from '@/services/task-service';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
// --- MODIFICAÇÃO 2: Importar Popover e Calendar ---
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// --- FIM DA MODIFICAÇÃO ---

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Importar cn para classnames condicionais

export default function TaskManager() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Estados dos modais
  const [showModal, setShowModal] = useState<boolean>(false); // Modal de "Criar"
  const [showViewModal, setShowViewModal] = useState<boolean>(false); // Modal de "Visualizar"

  // Estado do formulário de nova tarefa
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<"DAILY" | "SINGLE">('SINGLE');
  // --- MODIFICAÇÃO 3: Adicionar estado para a data da nova tarefa ---
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>();

  // Estado dos dados
  const [tasks, setTasks] = useState<Occurrence[]>([]); // Lista de ocorrências do dia
  const [currentTaskDetails, setCurrentTaskDetails] = useState<Task | null>(null); // Detalhes da Task (de getTaskById)
  const [currentTaskStatus, setCurrentTaskStatus] = useState<Occurrence['status'] | null>(null); // Status (da Occurrence)
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);

  // Estados da UI de data
  const [selectedDate, setSelectedDate] = useState<number>(2); // 2 é o índice de "hoje"
  const [dates, setDates] = useState<Array<{ date: string; day: string; index: number; fullDate: Date }>>([]);
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    // Gerar datas dinâmicas
    const today = new Date();
    const generatedDates = [];

    for (let i = -2; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];

      generatedDates.push({
        date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`,
        day: dayOfWeek,
        index: i + 2,
        fullDate: date,
      });
    }

    setDates(generatedDates);

    // Formatar data atual para exibição
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    setCurrentDateFormatted(`Hoje, ${today.getDate()} de ${months[today.getMonth()]}`);
  }, []);

  const fetchTasksForSelectedDate = async () => {
    if (dates.length === 0) {
      return; 
    }
    
    const selectedDateObj = dates.find(d => d.index === selectedDate);
    
    if (!selectedDateObj) {
      console.error("Não foi possível encontrar a data selecionada.");
      return;
    }
    
    const dateString = selectedDateObj.fullDate.toLocaleDateString('en-CA');
    
    setIsLoadingTasks(true);
    try {
      const data = await getTasksByDay(dateString);
      setTasks(data);
    } catch (error) {
      console.error(`Erro ao buscar tarefas para o dia ${dateString}:`, error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasksForSelectedDate();
  }, [selectedDate, dates]);


  const handleToggleTask = async (taskId: string): Promise<void> => {
    const selectedDateObj = dates.find(d => d.index === selectedDate);
    if (!selectedDateObj) {
      console.error("Data selecionada não encontrada ao tentar dar toggle.");
      return;
    }
    const dateString = selectedDateObj.fullDate.toLocaleDateString('en-CA');

    await toggleTask(taskId, dateString);
    
    fetchTasksForSelectedDate();
  };

  // --- MODIFICAÇÃO 4: Limpar o novo estado de data ---
  const clearNewTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskType('SINGLE');
    setNewTaskDate(undefined); // Limpar a data
  }

  // --- MODIFICAÇÃO 5: Lógica de data no handleAddTask ---
  const handleAddTask = async (): Promise<void> => {
    if (!newTaskTitle.trim()) return;

    let finalDate: string;

    // Se for 'SINGLE', usa a data do calendário
    if (newTaskType === 'SINGLE') {
      if (!newTaskDate) {
        console.error("Data é obrigatória para Tarefa Única");
        // Aqui você pode adicionar um toast de erro
        return; 
      }
      finalDate = newTaskDate.toLocaleDateString('en-CA');
    
    // Se for 'DAILY', usa a data da aba selecionada (como data de início)
    } else { 
      const selectedDateObj = dates.find(d => d.index === selectedDate);
      if (!selectedDateObj) {
        console.error("Data selecionada não encontrada ao adicionar tarefa diária.");
        return;
      }
      finalDate = selectedDateObj.fullDate.toLocaleDateString('en-CA');
    }

    const newTask: CreateTaskRequest = {
      title: newTaskTitle,
      description: newTaskDescription,
      type: newTaskType,
      date: finalDate, // Usa a data final decidida
    };

    await createTask(newTask);
    // O 'onOpenChange' vai lidar com a limpeza do formulário
    setShowModal(false); 
    fetchTasksForSelectedDate();
  };
  // --- FIM DA MODIFICAÇÃO ---


  const handleViewTask = async (taskId: string, status: Occurrence['status']): Promise<void> => {
    setIsLoadingDetails(true);
    setCurrentTaskStatus(status);
    setShowViewModal(true);
    try {
      const taskDetails = await getTaskById(taskId);
      setCurrentTaskDetails(taskDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes da tarefa:", error);
      setShowViewModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeViewModal = (): void => {
    setShowViewModal(false);
  };
  
  const formatTaskDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return "Data inválida";
    }
  };

  const pendingTasks = tasks.filter(task => task.status !== 'DONE');
  const doneTasks = tasks.filter(task => task.status === 'DONE');

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-5">
          <div className="max-w-[960px] mx-auto space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm px-6 py-3">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 text-blue-500">
                  <IceCreamCone />
                </div>
                <h2 className="text-slate-800 dark:text-slate-200 text-lg font-bold">Gestor de Tarefas</h2>
              </div>
              {/* <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? '☀️' : '🌙'}
                </Button>
                <Button variant="outline" size="icon">
                  <Bell size={20} />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gradient from-blue-400 to-purple-500"></div>
              </div> */}
            </header>

            {/* Title Section */}
            <div className="flex flex-wrap justify-between gap-4 items-center p-4">
              <div className="flex flex-col gap-1">
                <p className="text-slate-800 dark:text-slate-200 text-4xl font-black">{currentDateFormatted}</p>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                  {isLoadingTasks 
                    ? "Carregando tarefas..." 
                    : `Você tem ${pendingTasks.length} ${pendingTasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'}.`
                  }
                </p>
              </div>

              {/* --- MODIFICAÇÃO 6: onOpenChange para limpar/default --- */}
              <Dialog open={showModal} onOpenChange={(open) => {
                  if (open) {
                    // Define a data padrão do calendário para a data da aba selecionada
                    const selectedDateObj = dates.find(d => d.index === selectedDate);
                    if (selectedDateObj) {
                      setNewTaskDate(selectedDateObj.fullDate);
                    }
                  } else {
                    // Limpa o formulário quando o modal é fechado
                    clearNewTaskForm();
                  }
                  setShowModal(open);
                }}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus size={20} className="mr-2" />
                    Adicionar Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                  e.preventDefault();
                }}>
                  <DialogHeader>
                    <DialogTitle>Nova Tarefa</DialogTitle>
                    <DialogDescription>
                      Preencha os campos abaixo para criar uma nova tarefa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Título
                      </Label>
                      <Input
                        id="title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="col-span-3"
                        placeholder="Digite o título da tarefa..."
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="Adicione uma descrição..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                       <Label className="text-right pt-2">
                        Tipo
                      </Label>
                      <RadioGroup
                        value={newTaskType}
                        onValueChange={(value) => setNewTaskType(value as "DAILY" | "SINGLE")}
                        defaultValue="SINGLE"
                        className="col-span-3 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SINGLE" id="r-single" />
                          <Label htmlFor="r-single">Tarefa Única</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="DAILY" id="r-daily" />
                          <Label htmlFor="r-daily">Tarefa Diária (Recorrente)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* --- MODIFICAÇÃO 7: Calendário condicional --- */}
                    {newTaskType === 'SINGLE' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Data
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "col-span-3 justify-start text-left font-normal",
                                !newTaskDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newTaskDate ? (
                                format(newTaskDate, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newTaskDate}
                              onSelect={setNewTaskDate}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    {/* --- FIM DA MODIFICAÇÃO --- */}

                  </div>
                  <DialogFooter>
                    {/* --- MODIFICAÇÃO 8: Simplificar botão Cancelar --- */}
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddTask}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between px-4 py-3">
              <Button variant="outline" size="icon">
                <ChevronLeft size={20} />
              </Button>
              <div className="flex items-center justify-center gap-4">
                {dates.map((d) => (
                  <button
                    key={d.index}
                    onClick={() => setSelectedDate(d.index)}
                    className={`flex flex-col items-center justify-center rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedDate === d.index
                        ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{d.date}</span>
                    <span>{d.day}</span>
                  </button>
                ))}
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight size={20} />
              </Button>
            </div>

            {/* Tasks List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-4">
                {/* Lista de Pendentes */}
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-4">Pendentes</h3>
                
                {isLoadingTasks ? (
                  <div className="flex justify-center items-center min-h-[100px]">
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse">
                      Carregando tarefas...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
                    {pendingTasks.length === 0 && (
                      <p className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                        Nenhuma tarefa pendente.
                      </p>
                    )}
                    {pendingTasks.map((task) => (
                      <div
                        key={task.taskId}
                        className="group flex items-center gap-4 px-4 min-h-14 justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-150"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex size-7 items-center justify-center">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => handleToggleTask(String(task.taskId))}
                              className="h-5 w-5"
                            />
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-base font-normal leading-normal flex-1 truncate">{task.title}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {task.type === 'DAILY' && (
                            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">Diário</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 dark:text-slate-400 hover:text-blue-500"
                            onClick={() => handleViewTask(String(task.taskId), task.status)}
                          >
                            <Eye size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                {/* Lista de Concluídas (só mostra se não estiver carregando) */}
                {!isLoadingTasks && doneTasks.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-6 mb-3 px-4">Concluídas</h3>
                    <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
                      {doneTasks.map((task) => (
                        <div
                          key={task.taskId}
                          className="group flex items-center gap-4 px-4 min-h-14 justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-150"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex size-7 items-center justify-center">
                              <Checkbox
                                checked={true}
                                onCheckedChange={() => handleToggleTask(String(task.taskId))}
                                className="h-5 w-5"
                              />
                            </div>
                            <p className="text-slate-500 dark:text-slate-500 text-base font-normal leading-normal flex-1 truncate line-through">{task.title}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {task.type === 'DAILY' && (
                              <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">Diário</span>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 dark:text-slate-400 hover:text-blue-500"
                              onClick={() => handleViewTask(String(task.taskId), task.status)}
                            >
                              <Eye size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Visualização (Shadcn) */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="sm:max-w-md" onTransitionEnd={() => {
            if (!showViewModal) {
              setCurrentTaskDetails(null);
              setCurrentTaskStatus(null);
            }
          }}>
            <DialogHeader>
              <DialogTitle className="text-2xl break-words">
                {isLoadingDetails ? "Carregando..." : (currentTaskDetails?.title || "Detalhes da Tarefa")}
              </DialogTitle>
              <DialogDescription>
                {isLoadingDetails ? "Buscando informações..." : "Detalhes da tarefa selecionada."}
              </DialogDescription>
            </DialogHeader>

            {isLoadingDetails && (
              <div className="flex justify-center items-center min-h-[200px]">
                <p className="text-slate-700 dark:text-slate-300 text-lg animate-pulse">
                  Aguarde...
                </p>
              </div>
            )}
            
            {!isLoadingDetails && currentTaskDetails && (
              <>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label>Descrição</Label>
                    <div className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[100px] whitespace-pre-wrap break-words">
                      {currentTaskDetails.description || (
                        <span className="italic text-slate-500 dark:text-slate-400">
                          Sem descrição.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <Label>Status</Label> <br />
                      <Badge variant={currentTaskStatus === 'DONE' ? 'default' : 'secondary'}
                        className={currentTaskStatus === 'DONE' 
                          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                          : 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                        }
                      >
                        {currentTaskStatus === 'DONE' ? 'Concluída' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label>Tipo</Label> <br />
                      <Badge variant="outline">
                        {currentTaskDetails.type === 'DAILY' ? 'Diário' : 'Tarefa Única'}
                      </Badge>
                    </div>
                     <div className="space-y-1">
                      <Label>Data de Início</Label> <br />
                       <span className="text-sm text-slate-700 dark:text-slate-300">
                        {formatTaskDate(currentTaskDetails.date)}
                       </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeViewModal}>
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}