import express, { Request, Response } from "express";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { EntityService } from "../services";

export const domainRouter = express.Router();

domainRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Entities as EntityService;
        return res.json({ data: await db.getAll({ is_domain: true }) });
    });
