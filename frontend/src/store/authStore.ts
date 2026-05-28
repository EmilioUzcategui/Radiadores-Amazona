import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos los tipos para TypeScript
export interface AuthUser {
    id: string;
    email: string;
    names: string;
    last_names: string;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;

    // Acciones
    setLogin: (token: string, user: AuthUser) => void;
    setUser: (user: AuthUser) => void;
    setLogout: () => void;
}

// 2. Creamos el Store con "persist"
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Estado inicial
            token: null,
            user: null,
            isAuthenticated: false,

            // Acción para guardar los datos cuando el backend responde "OK"
            setLogin: (token, user) => set({
                token,
                user,
                isAuthenticated: true
            }),

            setUser: (user) => set((state) => ({
                ...state,
                user,
                isAuthenticated: Boolean(state.token),
            })),

            // Acción para cerrar sesión (borra todo)
            setLogout: () => set({
                token: null,
                user: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'auth-storage', // Nombre con el que se guardará en localStorage
        }
    )
);