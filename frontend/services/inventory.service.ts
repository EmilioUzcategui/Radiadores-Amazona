import api from "../lib/api";

export type InventoryProduct = {
    sku: string;
    codigo_oem: string | null;
    modelo_vehiculo: string | null;
    material: string | null;
    marca_vehiculo: string | null;
};

export type InventoryStock = {
    stock_actual: number | null;
    stock_minimo: number | null;
    ventas_promedio_mensual: number | null;
    costo_unitario_usd: number | null;
    precio_venta_usd: number | null;
    ultima_actualizacion: string | null;
};

export type InventoryMovement = {
    stock_anterior: number | null;
    stock_nuevo: number | null;
    diferencia: number | null;
    fecha_movimiento: string | null;
};

export type InventoryApiItem = {
    sku: string;
    producto: InventoryProduct;
    inventario: InventoryStock;
    ultimo_movimiento: InventoryMovement | null;
};

type InventoryResponse = {
    success: boolean;
    message: string;
    data: {
        items: InventoryApiItem[];
    };
};

export type InventoryHistoryPoint = {
    dia: string;
    stock: number | null;
};

export type InventoryHistory = {
    sku: string;
    days: number;
    points: InventoryHistoryPoint[];
};

type InventoryHistoryResponse = {
    success: boolean;
    message: string;
    data: InventoryHistory;
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

export const inventoryService = {
    async listInventory(): Promise<InventoryApiItem[]> {
        try {
            const response = await api.get<InventoryResponse>("/api/inventory");

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudo cargar el inventario");
            }

            return response.data.data?.items ?? [];
        } catch (error: unknown) {
            console.error("Error al cargar inventario:", error);
            throw new Error(getErrorMessage(error, "No se pudo cargar el inventario"));
        }
    },

    async getInventoryHistory30d(sku: string): Promise<InventoryHistoryPoint[]> {
        try {
            const response = await api.get<InventoryHistoryResponse>(
                `/api/inventory/${encodeURIComponent(sku)}/history`,
                { params: { days: 30 } },
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "No se pudo cargar el histórico");
            }

            return response.data.data?.points ?? [];
        } catch (error: unknown) {
            console.error("Error al cargar histórico de inventario:", error);
            throw new Error(getErrorMessage(error, "No se pudo cargar el histórico de inventario"));
        }
    },
};
