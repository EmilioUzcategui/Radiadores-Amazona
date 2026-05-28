import { Router } from "express";
import { getInventory, getPredictiveInventory } from "./inventory.controller";

const inventoryRouter = Router();

inventoryRouter.get("/", getInventory);
inventoryRouter.get("/predictions", getPredictiveInventory);

export default inventoryRouter;
