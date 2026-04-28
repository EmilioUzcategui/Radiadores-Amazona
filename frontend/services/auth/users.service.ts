import api from "../../lib/api";

type LoginResponse = {
    success: boolean;
    message: string;
    token: string;
    data: {
        id: string;
        email: string;
        names: string;
        last_names: string;
    };
};

type RequestRecoveryCodeResponse = {
    success: boolean;
    message: string;
    data?: {
        email: string;
        expiresAt: string;
    };
};

type VerifyRecoveryCodeResponse = {
    success: boolean;
    message: string;
    data?: {
        email: string;
        code: string;
        expiresAt?: string;
    };
};

type ResetPasswordResponse = {
    success: boolean;
    message: string;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
    ) {
        return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallbackMessage;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
    ) {
        return (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? fallbackMessage;
    }

    return fallbackMessage;
};

export const usersService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await api.post("/api/users/login", {
                email,
                password,
            });
            return response.data;
        }
        catch (error: unknown) {
            console.error("Error al iniciar sesión:", error);
            throw new Error(
                getErrorMessage(error, "Error al iniciar sesión")
            );
        }
    },

    async requestPasswordRecoveryCode(email: string): Promise<RequestRecoveryCodeResponse> {
        try {
            const response = await api.post("/api/users/request-recovery-code", {
                email,
            });
            return response.data;
        }
        catch (error: unknown) {
            console.error("Error al solicitar código de recuperación:", error);
            throw new Error(
                getErrorMessage(error, "Error al solicitar código de recuperación")
            );
        }
    },
    async verifyRecoveryCode(email: string, code: string): Promise<VerifyRecoveryCodeResponse> {
        try {
            const response = await api.post("/api/users/verify-recovery-code", {
                email,
                code,
            });
            return response.data;
        }
        catch (error: unknown) {
            console.error("Error al verificar código de recuperación:", error);
            throw new Error(
                getErrorMessage(error, "Error al verificar código de recuperación")
            );
        }
    },
    async resetPassword(email: string, code: string, newPassword: string): Promise<ResetPasswordResponse> {
        try {
            const response = await api.post("/api/users/reset-password", {
                email,
                code,
                newPassword,
            });
            return response.data;
        }
        catch (error: unknown) {
            console.error("Error al restablecer contraseña:", error);
            throw new Error(
                getErrorMessage(error, "Error al restablecer contraseña")
            );
        }
    },
};