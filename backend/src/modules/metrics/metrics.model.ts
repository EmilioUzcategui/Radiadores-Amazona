import { query } from "../../config/database/db";
import type { ChatHistory, GetConversationalMetricsQuery } from "./metrics.schema";

type DbChatHistoryRow = {
	id: number;
	session_id: string;
	message: Record<string, unknown> | string | null;
	fecha_hora: string | Date | null;
	tipo_emisor: string | null;
	procesado_analitica: boolean | null;
};

// Definimos el tipo de respuesta para el frontend
export type DashboardSummaryMetrics = {
	producto_mas_preguntado: string | null;
	categoria_mas_preguntada: string | null;
	radiador_menos_preguntado: string | null;
	categoria_menos_preguntada: string | null;
	hora_mas_trafico: string | null;
	hora_menos_trafico: string | null;
};

const parseJsonMessage = (value: DbChatHistoryRow["message"]):
	| Record<string, unknown>
	| null => {
	if (!value) {
		return null;
	}

	if (typeof value === "string") {
		try {
			return JSON.parse(value) as Record<string, unknown>;
		} catch {
			return null;
		}
	}

	return value;
};

const sanitizeHumanMessage = (
	message: Record<string, unknown> | null,
): Record<string, unknown> | null => {
	if (!message) {
		return null;
	}

	const content = typeof message.content === "string" ? message.content : null;
	if (!content) {
		return message;
	}

	const markerMatch = /el cliente dice:\s*/i.exec(content);
	if (!markerMatch) {
		return message;
	}

	const trimmedContent = content.slice(markerMatch.index + markerMatch[0].length).trim();
	return { ...message, content: trimmedContent };
};

const mapChatHistory = (row: DbChatHistoryRow): ChatHistory => {
	return {
		id: row.id,
		session_id: row.session_id,
		message: sanitizeHumanMessage(parseJsonMessage(row.message)),
		fecha_hora: row.fecha_hora ? new Date(row.fecha_hora) : null,
		tipo_emisor: row.tipo_emisor,
		procesado_analitica: row.procesado_analitica,
	};
};

const baseConversationalMetricsQuery = `
	SELECT
		h.id,
		h.session_id,
		h.message,
		h.fecha_hora,
		h.tipo_emisor,
		h.procesado_analitica
	FROM n8n_chat_histories h
	WHERE h.message ->> 'type' = 'human'
`;

const buildPagination = (params?: GetConversationalMetricsQuery) => {
	const values: number[] = [];
	let clause = "";

	if (params?.limit !== undefined) {
		values.push(params.limit);
		clause += ` LIMIT $${values.length}`;
	}

	if (params?.offset !== undefined) {
		values.push(params.offset);
		clause += ` OFFSET $${values.length}`;
	}

	return { clause, values };
};

export const getConversationalMetricsModel = async (
	params?: GetConversationalMetricsQuery,
): Promise<ChatHistory[]> => {
	const { clause, values } = buildPagination(params);
	const result = await query(
		`${baseConversationalMetricsQuery} ORDER BY h.fecha_hora DESC${clause}`,
		values,
	);

	return result.rows.map((row) => mapChatHistory(row as DbChatHistoryRow));
};

export const getDashboardSummaryMetricsModel = async (): Promise<DashboardSummaryMetrics> => {
	// 1. Producto más preguntado
	const mostAskedProductRes = await query(`
        SELECT producto_mencionado
        FROM metricas_conversacionales
        WHERE producto_mencionado IS NOT NULL
        GROUP BY producto_mencionado
        ORDER BY COUNT(*) DESC
        LIMIT 1
    `);

	// 2. Producto menos preguntado
	const leastAskedProductRes = await query(`
        SELECT producto_mencionado
        FROM metricas_conversacionales
        WHERE producto_mencionado IS NOT NULL
        GROUP BY producto_mencionado
        ORDER BY COUNT(*) ASC
        LIMIT 1
    `);

	// 3. Categoria mas preguntada
	const mostAskedCategoryRes = await query(`
		SELECT categoria_mencionada
		FROM metricas_conversacionales
		WHERE categoria_mencionada IS NOT NULL
		GROUP BY categoria_mencionada
		ORDER BY COUNT(*) DESC
		LIMIT 1
	`);

	// 4. Categoria menos preguntada
	const leastAskedCategoryRes = await query(`
		SELECT categoria_mencionada
		FROM metricas_conversacionales
		WHERE categoria_mencionada IS NOT NULL
		GROUP BY categoria_mencionada
		ORDER BY COUNT(*) ASC
		LIMIT 1
	`);

	// 5. Hora con más tráfico (Se extrae solo la hora del timestamp)
	const peakHourRes = await query(`
        SELECT EXTRACT(HOUR FROM fecha_interaccion) AS hour_of_day
        FROM metricas_conversacionales
        WHERE fecha_interaccion IS NOT NULL
        GROUP BY hour_of_day
        ORDER BY COUNT(*) DESC
        LIMIT 1
    `);

	// 6. Hora con menos tráfico
	const lowestHourRes = await query(`
        SELECT EXTRACT(HOUR FROM fecha_interaccion) AS hour_of_day
        FROM metricas_conversacionales
        WHERE fecha_interaccion IS NOT NULL
        GROUP BY hour_of_day
        ORDER BY COUNT(*) ASC
        LIMIT 1
    `);

	// Función auxiliar para formatear la hora en ventanas de 2 horas (Ej: 10 -> "10:00 - 12:00")
	const formatHourWindow = (hour: number | string | null | undefined): string | null => {
		if (hour === null || hour === undefined) return null;
		const parsedHour = Number(hour);
		const start = parsedHour.toString().padStart(2, '0');
		const end = ((parsedHour + 2) % 24).toString().padStart(2, '0'); // Suma 2 horas y maneja medianoche
		return `${start}:00 - ${end}:00`;
	};

	return {
		producto_mas_preguntado: mostAskedProductRes.rows[0]?.producto_mencionado ?? null,
		radiador_menos_preguntado: leastAskedProductRes.rows[0]?.producto_mencionado ?? null,
		categoria_mas_preguntada: mostAskedCategoryRes.rows[0]?.categoria_mencionada ?? null,
		categoria_menos_preguntada: leastAskedCategoryRes.rows[0]?.categoria_mencionada ?? null,
		hora_mas_trafico: formatHourWindow(peakHourRes.rows[0]?.hour_of_day),
		hora_menos_trafico: formatHourWindow(lowestHourRes.rows[0]?.hour_of_day),
	};
};

export const getChatbotInteractionsCountModel = async (): Promise<number> => {
	const result = await query(`
		SELECT COUNT(*)::int AS total
		FROM metricas_conversacionales
		WHERE producto_mencionado IS NOT NULL
			OR categoria_mencionada IS NOT NULL
			OR intencion_principal IS NOT NULL
			OR marca_vehiculo_mencionada IS NOT NULL
	`);

	return Number(result.rows[0]?.total ?? 0);
};

type InventoryKpis = {
	critical_skus: number;
	arbitrage_opportunities: number;
};

const getArbitrageColumnName = async (): Promise<string> => {
	const result = await query(
		`
			SELECT column_name
			FROM information_schema.columns
			WHERE table_name = 'predicciones_comerciales'
				AND column_name IN ('oportunidad_arbitraje_usd', 'oportunidad_arbitraje')
			ORDER BY column_name DESC
			LIMIT 1
		`,
	);

	const column = result.rows[0]?.column_name as string | undefined;
	return column ?? 'oportunidad_arbitraje_usd';
};

export const getInventoryKpisModel = async (): Promise<InventoryKpis> => {
	const arbitrageColumn = await getArbitrageColumnName();
	const result = await query(
		`
			WITH latest AS (
				SELECT MAX(fecha_analisis) AS fecha
				FROM predicciones_comerciales
			)
			SELECT
				COUNT(*) FILTER (
					WHERE translate(
						LOWER(nivel_urgencia),
						'áéíóúüÁÉÍÓÚÜÑñ',
						'aeiouuAEIOUUNn'
					) LIKE 'crit%'
				)::int AS critical_skus,
				COUNT(*) FILTER (
					WHERE ${arbitrageColumn} IS NOT NULL AND ${arbitrageColumn} > 0
				)::int AS arbitrage_opportunities
			FROM predicciones_comerciales
			CROSS JOIN latest
			WHERE latest.fecha IS NULL OR fecha_analisis = latest.fecha
		`,
	);

	return {
		critical_skus: Number(result.rows[0]?.critical_skus ?? 0),
		arbitrage_opportunities: Number(result.rows[0]?.arbitrage_opportunities ?? 0),
	};
};

export const getMonthlySalesModel = async (): Promise<number> => {
	const result = await query(`
		SELECT
			COALESCE(
				SUM(COALESCE(ventas_promedio_mensual, 0) * COALESCE(precio_venta_usd, 0)),
				0
			)::numeric AS total
		FROM inventario_interno
	`);

	return Number(result.rows[0]?.total ?? 0);
};
