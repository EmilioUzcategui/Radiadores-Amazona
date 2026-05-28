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
    ultima_actualizacion: Date | null;
};

export type InventoryMovement = {
    stock_anterior: number | null;
    stock_nuevo: number | null;
    diferencia: number | null;
    fecha_movimiento: Date | null;
};

export type InventoryItem = {
    sku: string;
    producto: InventoryProduct;
    inventario: InventoryStock;
    ultimo_movimiento: InventoryMovement | null;
};

export type InventoryResponse = {
    items: InventoryItem[];
};

export type PredictiveInventoryMetrics = {
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
    fecha_analisis: Date | null;
};

export type PredictiveInventoryResponse = {
    analisis_predictivo: PredictiveInventoryMetrics[];
    resumen_ejecutivo: string | null;
};
