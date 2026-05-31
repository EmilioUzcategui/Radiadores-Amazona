import { Request, Response } from "express";
import {
    getInventoryHistoryModel,
    getInventoryModel,
    getPredictiveInventoryModel,
} from "./inventory.model";

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

export const getInventoryHistory = async (req: Request, res: Response) => {
    const rawSku = Array.isArray(req.params.sku) ? req.params.sku[0] : req.params.sku;
    const sku = rawSku?.trim();

    if (!sku) {
        return res.status(400).json({
            success: false,
            message: "El SKU del producto es requerido",
        });
    }

    const parsedDays = Number.parseInt(String(req.query.days ?? "30"), 10);
    const days = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 365) : 30;

    try {
        const data = await getInventoryHistoryModel(sku, days);

        return res.status(200).json({
            success: true,
            message: "Histórico de inventario obtenido correctamente",
            data,
        });
    } catch (error) {
        console.error("[inventory.controller] Error fetching inventory history:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener el histórico de inventario",
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
