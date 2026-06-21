import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface StudySession {
    topic: string;
    attentionScore: number;
    durationMinutes: number;
    date: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    token?: string;
    studySessions?: StudySession[];
    coursesCompleted?: number;
    skillsMastered?: number;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedToken = localStorage.getItem('neurobright_token');
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    withCredentials: true,
                    headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
                });
                setUser(res.data);
            } catch (error) {
                console.error('No valid session', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        if (userData.token) {
            localStorage.setItem('neurobright_token', userData.token);
        }
        setIsAuthModalOpen(false);
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error', error);
        }
        setUser(null);
        localStorage.removeItem('neurobright_token');
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthModalOpen, openAuthModal, closeAuthModal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
