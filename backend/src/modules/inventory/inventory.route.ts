import { Router } from "express";
import {
    getCompetitorPriceHistory,
    getInventory,
    getInventoryHistory,
    getPredictiveInventory,
} from "./inventory.controller";

const inventoryRouter = Router();

inventoryRouter.get("/", getInventory);
inventoryRouter.get("/predictions", getPredictiveInventory);
inventoryRouter.get("/:sku/history", getInventoryHistory);
inventoryRouter.get("/:sku/competitor-prices", getCompetitorPriceHistory);

export default inventoryRouter;
