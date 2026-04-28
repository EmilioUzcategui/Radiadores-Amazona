import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Esto es importante para enviar cookies en solicitudes CORS
});

type PersistedAuthStorage = {
    state?: {
        token?: string | null;
    };
};

const getTokenFromPersistedAuth = (): string | null => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const rawStorage = window.localStorage.getItem("auth-storage");
        if (!rawStorage) {
            return null;
        }

        const parsedStorage = JSON.parse(rawStorage) as PersistedAuthStorage;
        return parsedStorage.state?.token ?? null;
    } catch {
        return null;
    }
};

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use((config) => {
    if (!config.headers.Authorization) {
        const persistedToken = getTokenFromPersistedAuth();
        if (persistedToken) {
            config.headers.Authorization = `Bearer ${persistedToken}`;
        }
    }

    return config;
});

export default api;