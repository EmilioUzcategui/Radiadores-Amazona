import { Router } from "express";
import {
    getChatbotInteractionsCount,
    getDashboardSummaryMetrics,
    getInventoryKpis,
    getMonthlySales,
    listConversationalMetrics,
} from "./metrics.controller";

const metricsRouter = Router();

metricsRouter.get("/conversational-history", listConversationalMetrics);
metricsRouter.get("/summary", getDashboardSummaryMetrics);
metricsRouter.get("/chatbot-interactions", getChatbotInteractionsCount);
metricsRouter.get("/inventory-kpis", getInventoryKpis);
metricsRouter.get("/monthly-sales", getMonthlySales);

export default metricsRouter;
