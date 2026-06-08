import { Request, Response } from "express";
import { ZodError } from "zod";
import { getWebsitesModel, updateWebsiteModel } from "./websites.model";
import { updateWebsiteBodySchema } from "./websites.schema";

export const getWebsites = async (_req: Request, res: Response) => {
    try {
        const data = await getWebsitesModel();

        return res.status(200).json({
            success: true,
            message: "Sitios web obtenidos correctamente",
            data,
        });
    } catch (error) {
        console.error("[websites.controller] Error fetching websites:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudieron obtener los sitios web",
        });
    }
};

export const updateWebsite = async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = rawId?.trim();

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "El identificador del sitio web es requerido",
        });
    }

    try {
        const changes = updateWebsiteBodySchema.parse(req.body);
        const updated = await updateWebsiteModel(id, changes);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "No se encontró el sitio web indicado",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sitio web actualizado correctamente",
            data: updated,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: error.issues,
            });
        }

        console.error("[websites.controller] Error updating website:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo actualizar el sitio web",
        });
    }
};
