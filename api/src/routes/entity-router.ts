import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { AuthUser, Storage } from "../data";
import { EntityService, UserService } from "../services";
import { ObjectId } from "mongodb";

export const entityRouter = express.Router();

entityRouter.get("/", RequiresData, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };
    return res.json({ data: await db.getAll() });
});

entityRouter.post("/", RequiresData, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };

    if (req.body.links.people) {
        req.body.links.people.forEach((element: any) => {
            element.id = new ObjectId(element.id);
        });



    }


    let results = await db.create(req.user, req.body);

    return res.json({ data: results });
});

entityRouter.get("/:id", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let userDB = req.store.Users as UserService;
        let { id } = req.params;

        let entity = await db.getById(id)

        if (entity) {
            for (let item of entity.links.people) {
                item.name = "Unknown";
                let person = await userDB.getUserById(item.id);

                if (person)
                    item.name = person.name;
            }

            for (let item of entity.links.entities) {
                item.name = "Unknown";
                let entity = await db.getById(item.id);

                if (entity)
                    item.name = entity.name;
            }

            console.log("THING", entity.links)

            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.put("/:id", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let results = await db.update(id, req.body);


        return res.json({ data: results });
    });