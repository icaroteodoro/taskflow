'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (data: any) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const res = await api.post('/auth/login', credentials);
        const { token, refreshToken, id, name, email } = res.data;

        // AuthResponse actually doesn't return refreshToken in the current implementation,
        // wait, I need to check backend AuthService to see if I returned refreshToken inside AuthResponse.
        // Yes, I need to make sure refreshToken is returned or simply store token.
        localStorage.setItem('token', token);
        if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
        }

        const userData = { id, name, email };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/');
    };

    const register = async (name: string, email: string, password: string) => {
        // API throws an error if already in use. Doesn't return tokens because verification is needed.
        await api.post('/auth/register', { name, email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
