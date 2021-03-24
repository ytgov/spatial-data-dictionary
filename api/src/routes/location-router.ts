import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { GenericService, LocationService } from "../services";

export const locationRouter = express.Router();

locationRouter.get("/", RequiresData,
    async (req: Request, res: Response) => {
        let db = req.store.Locations as LocationService;
        let list = await db.getAll();

        for (let item of list) {
            await buildConnections(item, req);
        }

        return res.json({ data: list });
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

        let list = await db.getAll();

        for (let item of list) {
            await buildConnections(item, req);
        }

        return res.json({ data: list, messages: [{ variant: "success", text: "Location created" }] });
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


        let list = await db.getAll();

        for (let item of list) {
            await buildConnections(item, req);
        }

        return res.json({ data: list, messages: [{ variant: "success", text: "Location edited" }] });
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

        let list = await db.getAll();

        for (let item of list) {
            await buildConnections(item, req);
        }

        return res.json({ data: list, messages: [{ variant: "success", text: "Location removed" }] });
    });

async function buildConnections(item: any, req: Request) {
    let personDb = req.store.Persons as GenericService;
    let person = await personDb.getById(item.approver_id);

    if (person)
        item.approver_name = `${person.first_name} ${person.last_name}`;
}