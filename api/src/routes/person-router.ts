import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { GenericService } from "../services";

export const personRouter = express.Router();

personRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Persons as GenericService;

        let list = await db.getAll();
        list.forEach(person => person.display_name = `${person.first_name} ${person.last_name}` + (person.status == "Inactive" ? " (Inactive)" : ""))

        return res.json({ data: list });
    });

personRouter.get("/active", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Persons as GenericService;

        let list = await db.getAll({ status: 'Active' });
        list.forEach(person => person.display_name = `${person.first_name} ${person.last_name}`)

        return res.json({ data: list });
    });

personRouter.get("/implementer", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Persons as GenericService;

        let list = await db.getAll({ status: 'Active' });
        list = list.filter(p => p.roles.indexOf("Implementer") > -1)

        list.forEach(person => person.display_name = `${person.first_name} ${person.last_name}`)

        return res.json({ data: list });
    });

personRouter.post("/", RequiresData,
    [
        body("first_name").notEmpty().isString(),
        body("last_name").notEmpty().isString(),
        body("status").notEmpty().isString()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Persons as GenericService;
        await db.create(req.body);

        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location created" }] });
    });

personRouter.put("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("first_name").notEmpty().isString(),
        body("last_name").notEmpty().isString(),
        body("status").notEmpty().isString()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Persons as GenericService;
        let { id } = req.params;

        await db.update(id, req.body);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location edited" }] });
    });

personRouter.delete("/:id", RequiresData,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Persons as GenericService;
        let { id } = req.params;

        await db.delete(id);
        return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Location removed" }] });
    });
