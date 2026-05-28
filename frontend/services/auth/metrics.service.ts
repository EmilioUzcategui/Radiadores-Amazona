import api from "../../lib/api";

type ChatHistoryMessage = {
    content?: string;
};

export type ChatHistoryItem = {
    id: number;
    session_id: string;
    message: ChatHistoryMessage | null;
    fecha_hora: string | null;
    tipo_emisor: string | null;
    procesado_analitica: boolean | null;
};

type ChatHistoryResponse = {
    success: boolean;
    message: string;
    data: ChatHistoryItem[];
};

export type GetConversationalHistoryParams = {
    limit?: number;
    offset?: number;
};

export type SummaryMetrics = {
    producto_mas_preguntado: string | null;
    categoria_mas_preguntada: string | null;
    radiador_menos_preguntado: string | null;
    categoria_menos_preguntada: string | null;
    hora_mas_trafico: string | null;
    hora_menos_trafico: string | null;
};

export type PredictiveInventoryItem = {
    sku: string;
    metricas: {
        nivel_urgencia: string | null;
        dias_estimados_quiebre: number | null;
        alerta_competitividad: string | null;
        oportunidad_arbitraje_usd: number | null;
        indice_rentabilidad_importacion: string | null;
    };
    recomendacion: {
        accion_sugerida: string | null;
        cantidad_sugerida_comprar: number | null;
        razonamiento_comercial: string | null;
    };
    fecha_analisis: string | null;
};

export type PredictiveInventoryData = {
    analisis_predictivo: PredictiveInventoryItem[];
    resumen_ejecutivo: string | null;
};

type SummaryMetricsResponse = {
    success: boolean;
    message: string;
    data: SummaryMetrics;
};

type ChatbotInteractionsResponse = {
    success: boolean;
    message: string;
    data: {
        count: number;
    };
};

type InventoryKpisResponse = {
    success: boolean;
    message: string;
    data: {
        critical_skus: number;
        arbitrage_opportunities: number;
    };
};

type MonthlySalesResponse = {
    success: boolean;
    message: string;
    data: {
        total: number;
    };
};

type PredictiveInventoryResponse = {
    success: boolean;
    message: string;
    data: PredictiveInventoryData;
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

export const metricsService = {
    async listConversationalHistory(
        params?: GetConversationalHistoryParams,
    ): Promise<ChatHistoryItem[]> {
        try {
            const response = await api.get<ChatHistoryResponse>(
                "/api/metrics/conversational-history",
                { params },
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar los chats");
            }

            return response.data.data ?? [];
        } catch (error: unknown) {
            console.error("Error al cargar historial de chats:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar los chats"));
        }
    },
    async getSummaryMetrics(): Promise<SummaryMetrics> {
        try {
            const response = await api.get<SummaryMetricsResponse>("/api/metrics/summary");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar las métricas");
            }

            return response.data.data;
        } catch (error: unknown) {
            console.error("Error al cargar métricas:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar las métricas"));
        }
    },
    async getPredictiveInventory(): Promise<PredictiveInventoryData> {
        try {
            const response = await api.get<PredictiveInventoryResponse>("/api/inventory/predictions");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar las predicciones");
            }

            return response.data.data;
        } catch (error: unknown) {
            console.error("Error al cargar predicciones:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar las predicciones"));
        }
    },
    async getChatbotInteractionsCount(): Promise<number> {
        try {
            const response = await api.get<ChatbotInteractionsResponse>("/api/metrics/chatbot-interactions");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar las interacciones");
            }

            return response.data.data?.count ?? 0;
        } catch (error: unknown) {
            console.error("Error al cargar interacciones:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar las interacciones"));
        }
    },
    async getInventoryKpis(): Promise<{ critical_skus: number; arbitrage_opportunities: number }> {
        try {
            const response = await api.get<InventoryKpisResponse>("/api/metrics/inventory-kpis");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar los KPIs");
            }

            return {
                critical_skus: response.data.data?.critical_skus ?? 0,
                arbitrage_opportunities: response.data.data?.arbitrage_opportunities ?? 0,
            };
        } catch (error: unknown) {
            console.error("Error al cargar KPIs de inventario:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar los KPIs"));
        }
    },
    async getMonthlySales(): Promise<number> {
        try {
            const response = await api.get<MonthlySalesResponse>("/api/metrics/monthly-sales");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudieron cargar las ventas del mes");
            }

            return response.data.data?.total ?? 0;
        } catch (error: unknown) {
            console.error("Error al cargar ventas del mes:", error);
            throw new Error(getErrorMessage(error, "No se pudieron cargar las ventas del mes"));
        }
    },
};
