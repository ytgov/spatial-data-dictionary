import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { Attribute, AuthUser, Entity, Storage } from "../data";
import { EntityService, GenericService, LocationService, ProgramService, UserService } from "../services";
import { ObjectId } from "mongodb";
import { v4 as uuidV4 } from "uuid";
import { GraphBuilder } from "../utils/directed-graph";

export const entityRouter = express.Router();

entityRouter.get("/", RequiresData, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };

    let allEntities = await db.getAll();

    for (let entity of allEntities) {
        await buildConnections(entity, req);
    }

    return res.json({ data: allEntities });
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

        const db = req.store.Entities as EntityService;
        let { id } = req.params;
        let entity = await db.getById(id)

        if (entity) {
            await buildConnections(entity, req);

            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.get("/:id/graph-data", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        let { id } = req.params;

        let builder = new GraphBuilder(db);
        let graph = await builder.BuildGraphForEntity(id)

        return res.json({ data: graph });
    });


entityRouter.get("/:id/request-change", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const changeDb = req.store.ChangeRequests as GenericService;
        let { id } = req.params;
        let entity = await db.getById(id)

        if (entity) {
            return res.json({ data: await changeDb.getAll({ entity_id: id }) });
        }

        res.status(404).send();
    });



entityRouter.post("/:id/request-change", [param("id").notEmpty().isMongoId()], RequiresData,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const changeDb = req.store.ChangeRequests as GenericService;
        let { id } = req.params;
        let entity = await db.getById(id)

        if (entity) {
            let change = req.body;
            change.entity_id = id;
            change.create_user = 'User 1';
            change.create_date = new Date();
            change.status = "Open";
            change.comments = [];

            let results = await changeDb.create(change);

            return res.json({
                data: results, messages: [{ text: "Change request added", variant: "success" }]
            });
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

        await buildConnections(results.value, req);

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
        let { _id } = req.body;
        let entity = await db.getById(id);

        if (entity) {
            let attributes = entity.attributes;

            let existing = attributes.filter(a => a._id == _id);

            console.log("EXISTIN", existing);

            if (existing) {
                if (existing.length == 0) {
                    req.body._id = uuidV4();
                    entity.attributes.push(req.body);
                } else {
                    let aIndex = attributes.indexOf(existing[0]);
                    entity.attributes[aIndex] = req.body;
                    console.log("SET EXISTN TO", entity.attributes[aIndex])
                }
            }
            //console.log("RESULT OF POST", entity)

            let results = await db.update(id, entity);

            await buildConnections(entity, req);
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
                entity.links.entities.push({ id: selectedEntity, role: "Source" });
            }

            let results = await db.update(id, entity);

            await buildConnections(entity, req);

            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.delete("/:id/connection/:connectionId", RequiresData,
    [
        param("id").notEmpty().isMongoId(),
        param("connectionId").notEmpty(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id, connectionId } = req.params;
        let entity = await db.getById(id);

        if (entity) {
            let connections = new Array();

            entity.links.entities.forEach((e: any) => {
                if (e._id === connectionId || e.id === connectionId) { }
                else {
                    connections.push(e);
                }
            })

            entity.links.entities = connections;
            let results = await db.update(id, entity);

            await buildConnections(entity, req);
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

async function buildConnections(entity: Entity, req: Request) {
    const db = req.store.Entities as EntityService;
    const userDB = req.store.Persons as GenericService;
    const programDB = req.store.Programs as ProgramService;
    const locationDB = req.store.Locations as LocationService;

    if (entity.location) {
        entity.location.name = "Unknown";

        let location = await locationDB.getById(entity.location.id);

        if (location) {
            entity.location.name = location.name;
            entity.location.type = location.type;
            entity.location.description = location.description;
        }
    }

    if (entity.attributes) {

        for (let attr of entity.attributes) {
            if (attr.domain && attr.domain.id) {
                let domain = await db.getById(attr.domain.id);

                if (domain) {
                    attr.domain.name = domain.name;
                }
            }

            if (attr.source && attr.source.id) {
                let attrEntity = await db.getByAttributeId(attr.source.id);
                attr.source.name = "Unknown"

                if (attrEntity) {
                    let found = attrEntity.attributes.find((item) => { return item._id == attr.source.id }) as Attribute;

                    if (found)
                        attr.source.name = `${attrEntity.name}.${found.name}`;
                    else
                        attr.source.name = "Unknown"
                }
            }
        }


    }

    if (entity.links) {
        if (entity.links.people) {
            for (let item of entity.links.people) {
                item.name = "Unknown";

                if (typeof (item.id) != 'string')
                    continue;

                let person = await userDB.getById(item.id);

                if (person)
                    item.name = `${person.first_name} ${person.last_name}`;
            }
        }

        if (entity.links.entities) {
            for (let item of entity.links.entities) {
                item.name = "Unknown";
                let entity = await db.getById(item.id);

                if (entity) {
                    item.name = entity.name;
                    item.attributes = entity.attributes;
                    item.description = entity.description;
                    item.status = entity.status;
                    item.location = entity.location;
                }
            }
        }

        if (entity.links.programs) {
            for (let item of entity.links.programs) {
                item.name = "Unknown";
                let program = await programDB.getById(item.id)

                if (program) {
                    item.name = program.name;
                }
            }
        }

        let childLinks = await db.findDownLinks(entity._id);
        if (childLinks && childLinks.length > 0) {
            entity.links.downstream = childLinks;
        }
    }
    else {
        entity.links = { people: [], entities: [] };
    }
}