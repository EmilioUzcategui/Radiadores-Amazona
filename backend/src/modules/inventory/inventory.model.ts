import { query } from "../../config/database/db";
import type {
    InventoryHistoryPoint,
    InventoryHistoryResponse,
    InventoryItem,
    InventoryResponse,
    PredictiveInventoryMetrics,
    PredictiveInventoryResponse,
} from "./inventory.schema";

type DbInventoryRow = {
    sku: string;
    codigo_oem: string | null;
    modelo_vehiculo: string | null;
    material: string | null;
    marca_vehiculo: string | null;
    stock_actual: number | string | null;
    stock_minimo: number | string | null;
    ventas_promedio_mensual: number | string | null;
    costo_unitario_usd: number | string | null;
    precio_venta_usd: number | string | null;
    ultima_actualizacion: string | Date | null;
    stock_anterior: number | string | null;
    stock_nuevo: number | string | null;
    diferencia: number | string | null;
    fecha_movimiento: string | Date | null;
};

type DbPredictiveRow = {
    id: string;
    sku_producto: string;
    nivel_urgencia: string | null;
    dias_estimados_quiebre: number | null;
    alerta_competitividad: string | null;
    oportunidad_arbitraje_usd?: number | string | null;
    oportunidad_arbitraje?: number | string | null;
    indice_rentabilidad_importacion?: string | null;
    indice_rentabilidad?: string | null;
    accion_sugerida: string | null;
    cantidad_sugerida: number | null;
    razonamiento_comercial: string | null;
    fecha_analisis: string | Date | null;
    resumen_ejecutivo: string | null;
};

const parseOptionalNumber = (value: number | string | null | undefined): number | null => {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const mapInventoryRow = (row: DbInventoryRow): InventoryItem => {
    return {
        sku: row.sku,
        producto: {
            sku: row.sku,
            codigo_oem: row.codigo_oem,
            modelo_vehiculo: row.modelo_vehiculo,
            material: row.material,
            marca_vehiculo: row.marca_vehiculo,
        },
        inventario: {
            stock_actual: parseOptionalNumber(row.stock_actual),
            stock_minimo: parseOptionalNumber(row.stock_minimo),
            ventas_promedio_mensual: parseOptionalNumber(row.ventas_promedio_mensual),
            costo_unitario_usd: parseOptionalNumber(row.costo_unitario_usd),
            precio_venta_usd: parseOptionalNumber(row.precio_venta_usd),
            ultima_actualizacion: row.ultima_actualizacion ? new Date(row.ultima_actualizacion) : null,
        },
        ultimo_movimiento: row.fecha_movimiento
            ? {
                stock_anterior: parseOptionalNumber(row.stock_anterior),
                stock_nuevo: parseOptionalNumber(row.stock_nuevo),
                diferencia: parseOptionalNumber(row.diferencia),
                fecha_movimiento: new Date(row.fecha_movimiento),
            }
            : null,
    };
};

export const getInventoryModel = async (): Promise<InventoryResponse> => {
    const result = await query(`
        SELECT
            p.sku,
            p.codigo_oem,
            p.modelo_vehiculo,
            p.material,
            p.marca_vehiculo,
            i.stock_actual,
            i.stock_minimo,
            i.ventas_promedio_mensual,
            i.costo_unitario_usd,
            i.precio_venta_usd,
            i.ultima_actualizacion,
            h.stock_anterior,
            h.stock_nuevo,
            h.diferencia,
            h.fecha_movimiento
        FROM inventario_interno i
        JOIN productos p ON p.sku = i.producto_sku
        LEFT JOIN LATERAL (
            SELECT
                h2.stock_anterior,
                h2.stock_nuevo,
                h2.diferencia,
                h2.fecha_movimiento
            FROM historial_inventario h2
            WHERE h2.producto_sku = i.producto_sku
            ORDER BY h2.fecha_movimiento DESC
            LIMIT 1
        ) h ON true
        ORDER BY p.sku
    `);

    const rows = result.rows as DbInventoryRow[];
    return {
        items: rows.map((row) => mapInventoryRow(row)),
    };
};

type DbHistoryRow = {
    dia: string | Date;
    stock: number | string | null;
};

export const getInventoryHistoryModel = async (
    sku: string,
    days: number,
): Promise<InventoryHistoryResponse> => {
    const result = await query(
        `
        WITH dias AS (
            SELECT generate_series(
                (CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day')::date,
                CURRENT_DATE,
                INTERVAL '1 day'
            )::date AS dia
        ),
        snapshots AS (
            SELECT
                d.dia,
                (
                    SELECT h.stock_nuevo
                    FROM historial_inventario h
                    WHERE h.producto_sku = $1
                      AND h.fecha_movimiento::date <= d.dia
                    ORDER BY h.fecha_movimiento DESC
                    LIMIT 1
                ) AS stock
            FROM dias d
        )
        SELECT
            s.dia,
            COALESCE(s.stock, i.stock_actual) AS stock
        FROM snapshots s
        LEFT JOIN inventario_interno i ON i.producto_sku = $1
        ORDER BY s.dia ASC
        `,
        [sku, days],
    );

    const rows = result.rows as DbHistoryRow[];
    const points: InventoryHistoryPoint[] = rows.map((row) => ({
        dia: row.dia instanceof Date ? row.dia.toISOString().slice(0, 10) : String(row.dia).slice(0, 10),
        stock: parseOptionalNumber(row.stock),
    }));

    return { sku, days, points };
};

const mapPredictiveRow = (row: DbPredictiveRow): PredictiveInventoryMetrics => {
    const rowRecord = row as Record<string, unknown>;
    const opportunityKey = Object.keys(rowRecord).find((key) => key.startsWith("oportunidad_arbitraje"));
    const opportunityValue = opportunityKey ? rowRecord[opportunityKey] : null;
    const oportunidadRaw = (opportunityValue ?? row.oportunidad_arbitraje_usd ?? row.oportunidad_arbitraje) as
        | number
        | string
        | null
        | undefined;
    const indiceRentabilidad = row.indice_rentabilidad_importacion ?? row.indice_rentabilidad ?? null;

    return {
        sku: row.sku_producto,
        metricas: {
            nivel_urgencia: row.nivel_urgencia,
            dias_estimados_quiebre: row.dias_estimados_quiebre,
            alerta_competitividad: row.alerta_competitividad,
            oportunidad_arbitraje_usd: parseOptionalNumber(oportunidadRaw),
            indice_rentabilidad_importacion: indiceRentabilidad,
        },
        recomendacion: {
            accion_sugerida: row.accion_sugerida,
            cantidad_sugerida_comprar: row.cantidad_sugerida,
            razonamiento_comercial: row.razonamiento_comercial,
        },
        fecha_analisis: row.fecha_analisis ? new Date(row.fecha_analisis) : null,
    };
};

export const getPredictiveInventoryModel = async (): Promise<PredictiveInventoryResponse> => {
    const result = await query(`
        WITH latest AS (
            SELECT MAX(fecha_analisis) AS fecha
            FROM predicciones_comerciales
        )
        SELECT pc.*
        FROM predicciones_comerciales pc
        CROSS JOIN latest
        WHERE latest.fecha IS NULL OR pc.fecha_analisis = latest.fecha
        ORDER BY pc.fecha_analisis DESC NULLS LAST
    `);

    const rows = result.rows as DbPredictiveRow[];
    const resumenRow = rows.find((row) => row.resumen_ejecutivo);

    return {
        analisis_predictivo: rows.map((row) => mapPredictiveRow(row)),
        resumen_ejecutivo: resumenRow?.resumen_ejecutivo ?? null,
    };
};
