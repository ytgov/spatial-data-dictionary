import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { AuthUser, Storage } from "../data";
import { EntityService, GenericService, UserService } from "../services";
import { ObjectId } from "mongodb";
import { configureAuthentication } from "./auth";

export const entityRouter = express.Router();

entityRouter.get("/", RequiresData, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };
    return res.json({ data: await db.getAll() });
});

entityRouter.post("/", RequiresData, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };

    if (req.body.links && req.body.links.people) {
        req.body.links.people.forEach((element: any) => {
            element.id = new ObjectId(element.id);
        });
    }

    if (req.body.links && req.body.links.entities) {
        req.body.links.entities.forEach((element: any) => {
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
            if (entity.links) {
                if (entity.links.people) {
                    for (let item of entity.links.people) {
                        item.name = "Unknown";
                        let person = await userDB.getUserById(item.id);

                        if (person)
                            item.name = person.name;
                    }
                }

                if (entity.links.entities) {
                    for (let item of entity.links.entities) {
                        item.name = "Unknown";
                        let entity = await db.getById(item.id);

                        if (entity)
                            item.name = entity.name;
                    }
                }
            }
            else {
                entity.links = { people: [], entities: [] };
            }

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
        delete req.body._id;
        let results = await db.update(id, req.body);
        results.value = await db.getById(id);

        return res.json({ data: results });
    });

entityRouter.delete("/:id", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let results = await db.delete(id);


        return res.json({ messages: [{ variant: "success", text: "Entity deleted" }] });
    });

entityRouter.post("/:id/attribute", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("name").notEmpty()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let { name, oldName } = req.body;
        let entity = await db.getById(id);

        if (entity) {
            let attributes = entity.attributes;

            let existing = attributes.filter(a => a.name == oldName);

            console.log("EXISTIN", existing);

            if (existing) {
                if (existing.length == 0) {
                    entity.attributes.push(req.body);
                } else {
                    let aIndex = attributes.indexOf(existing[0]);
                    entity.attributes[aIndex] = req.body;


                    console.log("SET EXISTN TO", entity.attributes[aIndex])
                }
            }
            console.log("RESULT OF POST", entity)

            let results = await db.update(id, entity);
            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.post("/:id/connection", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        body("connectionType").notEmpty(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let personDb = req.store.Persons as GenericService;
        let { id } = req.params;
        let { connectionType, selectedEntity, selectedPerson, personRole, newPersonEmail, newPersonFirstName, newPersonLastName } = req.body;
        console.log("ADDING CONNECTION TO ", req.body)

        /* connectionType: "Person"
        newPersonEmail: "michael@icefoganalytics.com"
        newPersonFirstName: "Michael"
        newPersonLastName: "Johnson"
        personRole: "Manager"
        selectedEntity: null */

        let entity = await db.getById(id);

        if (entity) {
            if (connectionType == "Person") {

                if (selectedPerson == null) {
                    let newPerson = personDb.create({ first_name: newPersonFirstName, last_name: newPersonLastName, email: newPersonEmail });
                }
                else {
                    entity.links.people.push({ id: selectedPerson, role: personRole });
                }



            }
            else if (connectionType == "Source Entity" && selectedEntity) {
                entity.links.entities.push({ id: selectedEntity, type: "Source" });
            }

            let results = await db.update(id, entity);

            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.get("/:id/attribute", RequiresData,
    [
        param("id").notEmpty().isMongoId()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let entity = await db.getById(id);

        if (entity) {
            return res.json({ data: entity.attributes });
        }

        res.status(404).send();
    });

/*
    name: this.editName,
    description: this.editDescription,
    type: this.editType,
    alias: this.editAlias,
    domain: this.editDomain,
    required: this.editRequired,
*/