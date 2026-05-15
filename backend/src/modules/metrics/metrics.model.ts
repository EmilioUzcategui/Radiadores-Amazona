import { query } from "../../config/database/db";
import type {
	ConversationalMetricWithHistory,
	GetConversationalMetricsQuery,
} from "./metrics.schema";

type DbConversationalMetricRow = {
	metric_id: string | number;
	metric_session_id: string;
	historial_chat_id: number | null;
	intencion_principal: string | null;
	producto_mencionado: string | null;
	marca_vehiculo_mencionado: string | null;
	fecha_interaccion: string | Date | null;
	chat_id: number | null;
	chat_session_id: string | null;
	message: Record<string, unknown> | string | null;
	fecha_hora: string | Date | null;
	tipo_emisor: string | null;
	procesado_analitica: boolean | null;
};

const parseJsonMessage = (value: DbConversationalMetricRow["message"]):
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

const mapConversationalMetric = (
	row: DbConversationalMetricRow,
): ConversationalMetricWithHistory => {
	return {
		id: String(row.metric_id),
		session_id: row.metric_session_id,
		historial_chat_id: row.historial_chat_id,
		intencion_principal: row.intencion_principal,
		producto_mencionado: row.producto_mencionado,
		marca_vehiculo_mencionado: row.marca_vehiculo_mencionado,
		fecha_interaccion: row.fecha_interaccion ? new Date(row.fecha_interaccion) : null,
		chat_history: row.chat_id
			? {
				  id: row.chat_id,
				  session_id: row.chat_session_id ?? row.metric_session_id,
				  message: parseJsonMessage(row.message),
				  fecha_hora: row.fecha_hora ? new Date(row.fecha_hora) : null,
				  tipo_emisor: row.tipo_emisor,
				  procesado_analitica: row.procesado_analitica,
			  }
			: null,
	};
};

const baseConversationalMetricsQuery = `
	SELECT
		m.id AS metric_id,
		m.session_id AS metric_session_id,
		m.historial_chat_id,
		m.intencion_principal,
		m.producto_mencionado,
		m.marca_vehiculo_mencionado,
		m.fecha_interaccion,
		h.id AS chat_id,
		h.session_id AS chat_session_id,
		h.message,
		h.fecha_hora,
		h.tipo_emisor,
		h.procesado_analitica
	FROM metricas_conversacionales m
	LEFT JOIN n8n_chat_histories h ON h.id = m.historial_chat_id
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
): Promise<ConversationalMetricWithHistory[]> => {
	const { clause, values } = buildPagination(params);
	const result = await query(
		`${baseConversationalMetricsQuery} ORDER BY m.fecha_interaccion DESC${clause}`,
		values,
	);

	return result.rows.map((row) => mapConversationalMetric(row as DbConversationalMetricRow));
};
