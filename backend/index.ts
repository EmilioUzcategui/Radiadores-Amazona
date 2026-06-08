import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import usersRouter from "./src/modules/auth/users/users.route";
import metricsRouter from "./src/modules/metrics/metrics.route";
import inventoryRouter from "./src/modules/inventory/inventory.route";
import { getWebsitesModel, updateWebsiteModel } from "./src/modules/websites/websites.model";
import { startMetricsJob } from "./src/jobs/metrics.job";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "API REST de Radiadores Amazona activa",
    });
});

app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        service: "backend",
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/scraping-sources", async (_req: Request, res: Response) => {
    try {
        const data = await getWebsitesModel();

        return res.status(200).json({
            success: true,
            message: "Sitios web obtenidos correctamente",
            data,
        });
    } catch (error) {
        console.error("[index] Error fetching scraping sources:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudieron obtener los sitios web",
        });
    }
});

app.patch("/api/scraping-sources/:id", async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = rawId?.trim();

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "El identificador del sitio web es requerido",
        });
    }

    try {
        const updated = await updateWebsiteModel(id, req.body);

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
        console.error("[index] Error updating scraping source:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo actualizar el sitio web",
        });
    }
});

app.use("/api/users", usersRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/inventory", inventoryRouter);

app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
    });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error no controlado:", err);

    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
    });
});

app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
    startMetricsJob();
});
