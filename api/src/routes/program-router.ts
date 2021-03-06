import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { ProgramService } from "../services";

export const programRouter = express.Router();

programRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Programs as ProgramService;
        return res.json({ data: await db.getAll() });
    });

    programRouter.post("/", RequiresData,
    [body("name").notEmpty().isString()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Programs as ProgramService;
        await db.create(req.body);

        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location created" }] });
    });

    programRouter.put("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("name").notEmpty().isString()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Programs as ProgramService;
        let { id } = req.params;

        await db.update(id, req.body);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location edited" }] });
    });

    programRouter.delete("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Programs as ProgramService;
        let { id } = req.params;

        await db.delete(id);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location removed" }] });
    });
