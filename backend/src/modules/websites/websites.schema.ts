import { z } from "zod";

// Niveles de prioridad usados por el flujo de scraping (mayor número = mayor prioridad).
// 3 = Alta, 2 = Media, 1 = Baja
export const PRIORIDAD_MIN = 1;
export const PRIORIDAD_MAX = 3;

export type WebsiteSource = {
    id: string;
    nombre: string;
    url: string;
    activo: boolean;
    prioridad: number;
    total_productos: number | null;
    tasa_exito: number | null;
    ultimo_scrapeo: Date | null;
};

export type WebsitesResponse = {
    items: WebsiteSource[];
};

export const updateWebsiteBodySchema = z
    .object({
        activo: z.boolean().optional(),
        prioridad: z.coerce.number().int().min(PRIORIDAD_MIN).max(PRIORIDAD_MAX).optional(),
    })
    .refine((data) => data.activo !== undefined || data.prioridad !== undefined, {
        message: "Debe enviar al menos un campo a actualizar: 'activo' o 'prioridad'",
    });

export type UpdateWebsiteBody = z.infer<typeof updateWebsiteBodySchema>;
