import api from "../lib/api";

export type WebsiteSource = {
    id: string;
    nombre: string;
    url: string;
    activo: boolean;
    prioridad: number; // 3 = Alta, 2 = Media, 1 = Baja
    total_productos: number | null;
    tasa_exito: number | null;
    ultimo_scrapeo: string | null;
};

type WebsitesResponse = {
    success: boolean;
    message: string;
    data: {
        items: WebsiteSource[];
    };
};

type WebsiteUpdateResponse = {
    success: boolean;
    message: string;
    data: WebsiteSource;
};

export type WebsiteUpdate = {
    activo?: boolean;
    prioridad?: number;
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

    return fallbackMessage;
};

export const websitesService = {
    async listWebsites(): Promise<WebsiteSource[]> {
        try {
            const response = await api.get<WebsitesResponse>("/api/scraping-sources");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar los sitios web");
            }

            return response.data.data?.items ?? [];
        } catch (error: unknown) {
            console.error("Error al cargar sitios web:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar los sitios web"));
        }
    },

    async updateWebsite(id: string, changes: WebsiteUpdate): Promise<WebsiteSource> {
        try {
            const response = await api.patch<WebsiteUpdateResponse>(
                `/api/scraping-sources/${encodeURIComponent(id)}`,
                changes,
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudo actualizar el sitio web");
            }

            return response.data.data;
        } catch (error: unknown) {
            console.error("Error al actualizar sitio web:", error);
            throw new Error(getErrorMessage(error, "No se pudo actualizar el sitio web"));
        }
    },
};
