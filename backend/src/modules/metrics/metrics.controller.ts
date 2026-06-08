import { Request, Response } from "express";
import { ZodError } from "zod";
import {
	getChatbotInteractionsCountModel,
	getConversationalMetricsModel,
	getDashboardSummaryMetricsModel,
	getInventoryKpisModel,
	getMonthlySalesModel,
	getProductsRankedByQuestionsModel,
} from "./metrics.model";
import { getConversationalMetricsQuerySchema } from "./metrics.schema";

const handleValidationError = (res: Response, error: unknown) => {
	if (error instanceof ZodError) {
		return res.status(400).json({
			success: false,
			message: "Datos invalidos",
			errors: error.issues,
		});
	}

	return null;
};

export const listConversationalMetrics = async (req: Request, res: Response) => {
	try {
		const params = getConversationalMetricsQuerySchema.parse(req.query);
		const data = await getConversationalMetricsModel(params);

		return res.status(200).json({
			success: true,
			message: "Metricas conversacionales obtenidas correctamente",
			data,
		});
	} catch (error) {
		const validationErrorResponse = handleValidationError(res, error);
		if (validationErrorResponse) {
			return validationErrorResponse;
		}

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener las metricas conversacionales",
		});
	}
};

export const getDashboardSummaryMetrics = async (req: Request, res: Response) => {
	try {
		const data = await getDashboardSummaryMetricsModel();

		return res.status(200).json({
			success: true,
			message: "Resumen de métricas obtenido correctamente",
			data,
		});
	} catch (error) {
		console.error("[metrics.controller] Error fetching summary metrics:", error);

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener las métricas de resumen",
		});
	}
};

export const getChatbotInteractionsCount = async (_req: Request, res: Response) => {
	try {
		const count = await getChatbotInteractionsCountModel();

		return res.status(200).json({
			success: true,
			message: "Interacciones obtenidas correctamente",
			data: {
				count,
			},
		});
	} catch (error) {
		console.error("[metrics.controller] Error fetching chatbot interactions:", error);

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener las interacciones",
		});
	}
};

export const getInventoryKpis = async (_req: Request, res: Response) => {
	try {
		const data = await getInventoryKpisModel();

		return res.status(200).json({
			success: true,
			message: "KPIs de inventario obtenidos correctamente",
			data,
		});
	} catch (error) {
		console.error("[metrics.controller] Error fetching inventory KPIs:", error);

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener los KPIs de inventario",
		});
	}
};

export const getProductsRankedByQuestions = async (_req: Request, res: Response) => {
	try {
		const data = await getProductsRankedByQuestionsModel();

		return res.status(200).json({
			success: true,
			message: "Productos ordenados por preguntas obtenidos correctamente",
			data,
		});
	} catch (error) {
		console.error("[metrics.controller] Error fetching products ranked by questions:", error);

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener los productos ordenados por preguntas",
		});
	}
};

export const getMonthlySales = async (_req: Request, res: Response) => {
	try {
		const total = await getMonthlySalesModel();

		return res.status(200).json({
			success: true,
			message: "Ventas del mes obtenidas correctamente",
			data: {
				total,
			},
		});
	} catch (error) {
		console.error("[metrics.controller] Error fetching monthly sales:", error);

		return res.status(500).json({
			success: false,
			message: "No se pudieron obtener las ventas del mes",
		});
	}
};
