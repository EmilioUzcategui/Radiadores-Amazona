import { Request, Response } from "express";
import { ZodError } from "zod";
import { getConversationalMetricsModel } from "./metrics.model";
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
