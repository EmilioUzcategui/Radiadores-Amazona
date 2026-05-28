import { Request, Response } from "express";
import { ZodError } from "zod";
import {
    authToken,
    AuthenticationRequest,
} from "../../../api/middlewares/auth.token";
import type { LoginUserData, RegisterUserData, User } from "../../../types/users";
import {
    createPasswordRecoveryTokenModel,
    createUserModel,
    deleteUserModel,
    getUserByEmailModel,
    getAllUsersModel,
    getUserByIdModel,
    loginUserModel,
    resetPasswordWithRecoveryCodeModel,
    updateUserModel,
    verifyPasswordRecoveryCodeModel,
} from "./users.model";
import {
    createUserSchema,
    loginUserSchema,
    requestRecoveryCodeSchema,
    resetPasswordSchema,
    updateUserSchema,
    verifyRecoveryCodeSchema,
} from "./users.schema";
import {
    generatePasswordRecoveryCode,
    sendRecoveryCodeEmail,
} from "../../../services/email.service";

const sanitizeUser = (user: User) => {
    const { password, ...safeUser } = user;
    return safeUser;
};

const handleValidationError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Datos inválidos",
            errors: error.issues,
        });
    }

    return null;
};

export const listUsers = async (_req: Request, res: Response) => {
    const users = (await getAllUsersModel()).map(sanitizeUser);

    return res.status(200).json({
        success: true,
        message: "Usuarios obtenidos correctamente",
        data: users,
    });
};

export const getUserById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await getUserByIdModel(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Usuario obtenido correctamente",
        data: sanitizeUser(user),
    });
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const payload = createUserSchema.parse(req.body) as RegisterUserData & {
            status?: boolean;
        };

        const newUser = await createUserModel(payload);

        return res.status(201).json({
            success: true,
            message: "Usuario creado correctamente",
            data: sanitizeUser(newUser),
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo crear el usuario",
        });
    }
};

export const registerUser = createUser;

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const payload = updateUserSchema.parse(req.body) as Partial<RegisterUserData> & {
            status?: boolean;
        };

        const updatedUser = await updateUserModel(id, payload);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: sanitizeUser(updatedUser),
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo actualizar el usuario",
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await deleteUserModel(id);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Usuario eliminado correctamente",
    });
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        console.log("Intentando iniciar sesión con datos:", req.body);
        const payload = loginUserSchema.parse(req.body) as LoginUserData;
        console.log("Datos de login validados:", payload);
        const user = await loginUserModel(payload);
        console.log("Resultado del modelo de login:", user ? { ...user, password: "****" } : null);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        const token = authToken({
            id: user.id,
            email: user.email,
            names: user.names,
        });

        return res.status(200).json({
            success: true,
            message: "Login exitoso",
            token,
            data: sanitizeUser(user),
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo iniciar sesión",
        });
    }
};

export const getCurrentUser = async (req: AuthenticationRequest, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "No autenticado",
        });
    }

    const userId = String(req.user.id);
    const user = await getUserByIdModel(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Usuario obtenido correctamente",
        data: sanitizeUser(user),
    });
};

export const updateCurrentUser = async (req: AuthenticationRequest, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "No autenticado",
        });
    }

    try {
        const payload = updateUserSchema.parse(req.body) as Partial<RegisterUserData> & {
            status?: boolean;
        };
        const userId = String(req.user.id);
        const updatedUser = await updateUserModel(userId, payload);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        const token = authToken({
            id: updatedUser.id,
            email: updatedUser.email,
            names: updatedUser.names,
        });

        return res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            token,
            data: sanitizeUser(updatedUser),
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo actualizar el usuario",
        });
    }
};

export const requestRecoveryCode = async (req: Request, res: Response) => {
    try {
        const payload = requestRecoveryCodeSchema.parse(req.body) as { email: string };
        const user = await getUserByEmailModel(payload.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No existe un usuario con ese correo",
            });
        }

        const code = generatePasswordRecoveryCode(6);
        const expiresInMinutes = 15;
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        await createPasswordRecoveryTokenModel({
            userId: user.id,
            token: code,
            expiresAt,
        });

        await sendRecoveryCodeEmail({
            to: user.email,
            code,
            names: user.names,
            expiresInMinutes,
        });

        return res.status(200).json({
            success: true,
            message: "Código de recuperación enviado correctamente",
            data: {
                email: user.email,
                expiresAt: expiresAt.toISOString(),
            },
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo enviar el código de recuperación",
        });
    }
};

export const verifyRecoveryCode = async (req: Request, res: Response) => {
    try {
        const payload = verifyRecoveryCodeSchema.parse(req.body) as {
            email: string;
            code: string;
        };

        const verification = await verifyPasswordRecoveryCodeModel(
            payload.email,
            payload.code,
        );

        if (!verification.isValid) {
            if (verification.isExpired) {
                return res.status(410).json({
                    success: false,
                    message: "El código expiró. Solicita uno nuevo",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Código inválido",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Código verificado correctamente",
            data: {
                email: payload.email.trim().toLowerCase(),
                code: payload.code.trim(),
                expiresAt: verification.expiresAt?.toISOString(),
            },
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo verificar el código",
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const payload = resetPasswordSchema.parse(req.body) as {
            email: string;
            code: string;
            newPassword: string;
        };

        const result = await resetPasswordWithRecoveryCodeModel(
            payload.email,
            payload.code,
            payload.newPassword,
        );

        if (!result.success) {
            if (result.isExpired) {
                return res.status(410).json({
                    success: false,
                    message: "El código expiró. Solicita uno nuevo",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Código inválido",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contraseña restablecida correctamente",
        });
    } catch (error) {
        const validationErrorResponse = handleValidationError(res, error);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo restablecer la contraseña",
        });
    }
};
