import { z } from "zod";

export const createUserSchema = z.object({
    names: z.string().trim().min(2, "El nombre es obligatorio"),
    last_names: z.string().trim().min(2, "Los apellidos son obligatorios"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    email: z.string().trim().email("El email no es válido"),
    role_id: z.number().int().positive("El role_id debe ser un número positivo"),
    identification_number: z.string().trim().min(5, "La identificación es obligatoria"),
    phone: z.string().trim().min(7, "El teléfono es obligatorio"),
    date_of_birth: z.string().optional(),
    birth_date: z.string().optional(),
    status: z.boolean().optional(),
});

export const updateUserSchema = createUserSchema
    .omit({ role_id: true, date_of_birth: true, birth_date: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Debes enviar al menos un campo para actualizar",
    });

export const loginUserSchema = z.object({
    email: z.string().trim().email("El email no es válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export const requestRecoveryCodeSchema = z.object({
    email: z.string().trim().email("El email no es válido"),
});

export const verifyRecoveryCodeSchema = z.object({
    email: z.string().trim().email("El email no es válido"),
    code: z.string().trim().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});

export const resetPasswordSchema = z.object({
    email: z.string().trim().email("El email no es válido"),
    code: z.string().trim().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RequestRecoveryCodeInput = z.infer<typeof requestRecoveryCodeSchema>;
export type VerifyRecoveryCodeInput = z.infer<typeof verifyRecoveryCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
