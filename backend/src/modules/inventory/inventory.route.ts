import { Router } from "express";
import {
    getInventory,
    getInventoryHistory,
    getPredictiveInventory,
} from "./inventory.controller";

const inventoryRouter = Router();

inventoryRouter.get("/", getInventory);
inventoryRouter.get("/predictions", getPredictiveInventory);
inventoryRouter.get("/:sku/history", getInventoryHistory);

export default inventoryRouter;
