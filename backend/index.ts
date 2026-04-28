import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import usersRouter from "./src/modules/auth/users/users.route";
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

app.use("/api/users", usersRouter);

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
