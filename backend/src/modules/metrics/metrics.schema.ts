import { z } from "zod";

export const getConversationalMetricsQuerySchema = z.object({
	limit: z.coerce.number().int().positive().max(500).optional(),
	offset: z.coerce.number().int().min(0).optional(),
});

export type GetConversationalMetricsQuery = z.infer<typeof getConversationalMetricsQuerySchema>;

export type ConversationalMetric = {
	id: string;
	session_id: string;
	historial_chat_id: number | null;
	intencion_principal: string | null;
	producto_mencionado: string | null;
	marca_vehiculo_mencionado: string | null;
	fecha_interaccion: Date | null;
};

export type ChatHistory = {
	id: number;
	session_id: string;
	message: Record<string, unknown> | null;
	fecha_hora: Date | null;
	tipo_emisor: string | null;
	procesado_analitica: boolean | null;
};

export type ConversationalMetricWithHistory = ConversationalMetric & {
	chat_history: ChatHistory | null;
};
