import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { CategoryService } from "../services";

export const categoryRouter = express.Router();

categoryRouter.get("/", RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        let db = req.store.Categories as CategoryService;
        return res.json({ data: await db.getAll() });
    });

categoryRouter.post("/", RequiresData, RequiresAuthentication,
    [body("name").notEmpty().isString()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Categories as CategoryService;
        let { name } = req.body;
        await db.create({ name });

        return res.json({});
    });
