import { Router } from "express";
import { listConversationalMetrics } from "./metrics.controller";

const metricsRouter = Router();

metricsRouter.get("/conversational-history", listConversationalMetrics);

export default metricsRouter;
