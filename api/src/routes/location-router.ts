import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { LocationService } from "../services";

export const locationRouter = express.Router();

locationRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Locations as LocationService;
        return res.json({ data: await db.getAll() });
    });

locationRouter.post("/", RequiresData,
    [body("name").notEmpty().isString()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Locations as LocationService;
        await db.create(req.body);

        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location created" }] });
    });

locationRouter.put("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("name").notEmpty().isString(),
        body("type").notEmpty().isString()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Locations as LocationService;
        let { id } = req.params;

        await db.update(id, req.body);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location edited" }] });
    });

locationRouter.delete("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Locations as LocationService;
        let { id } = req.params;

        await db.delete(id);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location removed" }] });
    });
