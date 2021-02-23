import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { GenericService } from "../services";

export const domainRouter = express.Router();

domainRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Domains as GenericService;
        return res.json({ data: await db.getAll() });
    });

domainRouter.post("/", RequiresData,
    [body("name").notEmpty().isString()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Domains as GenericService;
        await db.create(req.body);

        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location created" }] });
    });

domainRouter.put("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("name").notEmpty().isString()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Domains as GenericService;
        let { id } = req.params;

        await db.update(id, req.body);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Domain edited" }] });
    });

domainRouter.delete("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Domains as GenericService;
        let { id } = req.params;

        await db.delete(id);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Domain removed" }] });
    });
