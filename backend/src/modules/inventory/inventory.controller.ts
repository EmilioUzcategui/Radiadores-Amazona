import { Request, Response } from "express";
import { getInventoryModel, getPredictiveInventoryModel } from "./inventory.model";

export const getInventory = async (_req: Request, res: Response) => {
    try {
        const data = await getInventoryModel();

        return res.status(200).json({
            success: true,
            message: "Inventario obtenido correctamente",
            data,
        });
    } catch (error) {
        console.error("[inventory.controller] Error fetching inventory:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener el inventario",
        });
    }
};

export const getPredictiveInventory = async (_req: Request, res: Response) => {
    try {
        const data = await getPredictiveInventoryModel();

        return res.status(200).json({
            success: true,
            message: "Predicciones comerciales obtenidas correctamente",
            data,
        });
    } catch (error) {
        console.error("[inventory.controller] Error fetching predictions:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudieron obtener las predicciones comerciales",
        });
    }
};
