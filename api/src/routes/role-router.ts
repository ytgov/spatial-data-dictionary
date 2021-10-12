import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { EmailService, GenericService } from "../services";

export const roleRouter = express.Router();
const emailService = new EmailService();

roleRouter.get("/", RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        let db = req.store.Roles as GenericService;
        let list = await db.getAll();
        return res.json({ data: list });
    });

roleRouter.post("/", RequiresData, RequiresAuthentication,
    [body("name").notEmpty().isString(),],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Roles as GenericService;
        await db.create(req.body);

        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Role created" }] });
    });

roleRouter.put("/:id", RequiresData, RequiresAuthentication,
    [
        param("id").notEmpty().isMongoId(),
        body("name").notEmpty().isString(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Roles as GenericService;
        let { id } = req.params;

        await db.update(id, req.body);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Role saved" }] });
    });

roleRouter.delete("/:id", RequiresData, RequiresAuthentication,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Roles as GenericService;
        let { id } = req.params;

        await db.delete(id);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Role removed" }] });
    });
