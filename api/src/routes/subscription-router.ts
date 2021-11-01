import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { EmailService, EntityService, GenericService, ProgramService } from "../services";

export const subscriptionRouter = express.Router();
const emailService = new EmailService();

subscriptionRouter.get("/", RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        let db = req.store.Subscriptions as GenericService;
        let programDb = req.store.Programs as ProgramService;
        let entityDb = req.store.Entities as EntityService;

        let list = await db.getAll({ email: req.user.email });
        let programs = await programDb.getAll();
        let entities = await entityDb.getAll();

        for (let sub of list) {
            sub.name = "Unknown";

            if (sub.type == "Program") {
                let prog = programs.filter(p => p._id == sub.id);

                if (prog.length > 0)
                    sub.name = prog[0].name;
            }
            else if (sub.type == "Entity") {
                let ents = entities.filter((p: any) => p._id == sub.id);

                if (ents.length > 0)
                    sub.name = ents[0].name;
            }
        }

        return res.json({ data: list });
    });

subscriptionRouter.put("/", RequiresData, RequiresAuthentication,
    [
        body("id").notEmpty().isMongoId(),
        body("type").notEmpty().isString(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Subscriptions as GenericService;
        let { id, type } = req.body;
        let currentUser = req.user;

        let existing = await db.getAll({ type, id, email: currentUser.email });

        if (existing.length > 0) {
            let e1 = existing[0];
            await db.delete(e1._id);

            return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Unsubscribed" }] });
        } else {
            await db.create({ type, id, email: currentUser.email })


            return res.json({ data: await db.getAll(), messages: [{ variant: "success", text: "Subscribed" }] });
        }
    });
