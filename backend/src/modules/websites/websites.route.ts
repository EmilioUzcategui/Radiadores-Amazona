import { Router } from "express";
import { getWebsites, updateWebsite } from "./websites.controller";

const websitesRouter = Router();

websitesRouter.get("/", getWebsites);
websitesRouter.patch("/:id", updateWebsite);

export default websitesRouter;
