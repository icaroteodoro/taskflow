'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronDown, Settings, Moon, Sun, Calendar, List } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { useState } from 'react';

export default function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <header className="border-b bg-card sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <Image src="/logo.svg" alt="Taskflow Logo" width={32} height={32} className="block dark:hidden" priority />
                        <Image src="/logo-white.svg" alt="Taskflow Logo" width={32} height={32} className="hidden dark:block" priority />
                        <h1 className="text-xl font-bold dark:text-white text-primary hidden sm:block">Taskflow</h1>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/50">
                        <Link href="/">
                            <Button variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm" className="gap-2 h-8">
                                <List className="h-4 w-4" />
                                Dia
                            </Button>
                        </Link>
                        <Link href="/week">
                            <Button variant={pathname === '/week' ? 'secondary' : 'ghost'} size="sm" className="gap-2 h-8">
                                <Calendar className="h-4 w-4" />
                                Semana
                            </Button>
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="md:hidden flex items-center gap-1 mr-2">
                        <Link href="/">
                            <Button variant={pathname === '/' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8">
                                <List className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/week">
                            <Button variant={pathname === '/week' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8">
                                <Calendar className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

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
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </header>
    );
}
