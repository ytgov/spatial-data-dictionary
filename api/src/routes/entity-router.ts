import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { Attribute, AuthUser, Entity, SearchResult } from "../data";
import { EntityService, GenericService, LocationService, ProgramService } from "../services";
import { v4 as uuidV4 } from "uuid";
import { GraphBuilder } from "../utils/directed-graph";
import moment from "moment";
import _ from "lodash";

export const entityRouter = express.Router();

entityRouter.get("/", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    //let query = { 'user.username': "datajohnson" };

    let allEntities = await db.getAll();

    for (let entity of allEntities) {
        await buildConnections(entity, req);
    }

    return res.json({ data: allEntities });
});

entityRouter.post("/", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let db = req.store.Entities as EntityService;
    req.body.entity_type = "Table";

    let results = await db.create(req.user, req.body);

    return res.json({ data: results });
});

entityRouter.get("/changes", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;


    let results = await changeDb.getAll();

    for (let item of results) {
        let entity = await db.getById(item.entity_id);

        if (entity) {
            item.entity = entity;
            await buildConnections(item.entity, req);
        }
    }

    return res.json({ data: results });
});

entityRouter.get("/changes/open", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;

    let currentUser = req.user as AuthUser;
    let results = await changeDb.getAll({ assigned_user: currentUser.display_name });

    for (let item of results) {
        let entity = await db.getById(item.entity_id);

        if (entity) {
            item.entity = entity;
            await buildConnections(item.entity, req);
        }
    }

    return res.json({ data: results });
});

entityRouter.get("/request-change/open", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const db = req.store.Entities as EntityService;
    const requestDb = req.store.ChangeRequests as GenericService;

    let currentUser = req.user as AuthUser;
    let results = await requestDb.getAll({ status: "Open" });
    let awaiting = new Array();

    for (let item of results) {
        let entity = await db.getById(item.entity_id);

        if (entity) {
            await buildConnections(entity, req);

            let approveNames = item.comments
                .filter((f: any) => f.action.indexOf("Approve") >= 0)
                .map((f: any) => f.user);

            let requiredNames = [entity.location.approver_name];

            entity.links.programs.forEach((p: any) => {
                requiredNames.push(p.approver_name);
            });

            let missingApprovals = new Array<any>();

            requiredNames.forEach((n) => {
                if (approveNames.indexOf(n) == -1) missingApprovals.push(n);
            });

            if (missingApprovals.indexOf(currentUser.display_name) >= 0) {
                item.entity = entity;
                awaiting.push(item);
            }
        }
    }

    return res.json({ data: awaiting });
});

entityRouter.get("/changes/:id", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;
    let { id } = req.params;

    let change = await changeDb.getById(id)

    if (change) {
        return res.json({ data: change });
    }

    res.status(404).send();
});

entityRouter.put("/:id/changes/:changeId", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;
    let { id, changeId } = req.params;

    let change = await changeDb.getById(changeId);

    if (change) {
        let { complete_date, newStatus, assigned_user, description, comments } = req.body;

        change.complete_date = complete_date;
        change.status = newStatus || change.status;
        change.assigned_user = assigned_user;
        change.description = description;
        change.comments = comments;

        await changeDb.update(change._id, change);

        return res.json({ data: change });
    }

    res.status(404).send();
});

entityRouter.post("/search",
    [
        body("term").isString().notEmpty(),
        body("types").isArray().notEmpty()
    ], RequiresData, async (req: Request, res: Response) => {
        const db = req.store.Entities as EntityService;
        const changeDb = req.store.Changes as GenericService;

        let { term, types } = req.body;
        let allEntities = await db.getAll();

        let searchResult: SearchResult;
        let entityMatches = await db.search(term)

        for (let e of entityMatches) {
            await buildConnections(e, req);
        }

        searchResult = {
            entities: entityMatches,
        };


        res.json({ data: searchResult });
    });

entityRouter.get("/:id", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const subsDb = req.store.Subscriptions as GenericService;
        let { id } = req.params;
        let entity = await db.getById(id)

        if (entity) {
            let subs = await subsDb.getAll({ email: req.user.email, type: "Entity", id });

            if (subs.length > 0) {
                (entity as any).is_subscribed = true;
            }

            await buildConnections(entity, req);

            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.get("/:id/graph-data", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const locationDB = req.store.Locations as LocationService;
        const graphDB = req.store.GraphData as GenericService;

        let { id } = req.params;

        let builder = new GraphBuilder(db, locationDB, graphDB);
        let graph = await builder.BuildGraphForEntity(id);
        let hasPositions = (await graphDB.getAll({ parent_id: id })).length > 0

        return res.json({ data: graph, layout: hasPositions ? "preset" : "grid" });
    });

entityRouter.put("/:id/graph-positions",
    [param("id").notEmpty().isMongoId(), body("child_id").notEmpty()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { id } = req.params;
        let { child_id, x, y } = req.body;
        const db = req.store.GraphData as GenericService;
        let existing = await db.getAll({ parent_id: id });

        if (existing.length == 0) {
            await db.create({ parent_id: id, children: [{ child_id, x, y }] });
        }
        else {
            let item = existing[0];
            item.children = item.children.filter((c: any) => c.child_id != child_id);
            item.children.push({ child_id, x, y });
            await db.update(item._id, item);
        }

        return res.json({ messages: [{ variant: "success", text: "Position saved" }] });
    });

entityRouter.get("/:id/request-change", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
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
            return res.json({ data: await changeDb.getAll({ entity_id: id }, { date: -1 }) });
        }

        res.status(404).send();
    });

entityRouter.post("/:id/request-change", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const requestDb = req.store.ChangeRequests as GenericService;
        const changeDb = req.store.Changes as GenericService;
        let { id } = req.params;
        let entity = await db.getById(id);
        let currentUser = (req.session as any).user;

        if (entity) {
            let { change_type } = req.body;

            if (change_type == "Standard") {
                let { date, description, reason, title } = req.body;

                let change = {
                    create_date: new Date(),
                    title,
                    status: "Open",
                    description,
                    reason,
                    assigned_user: currentUser.display_name,
                    complete_date: date,
                    location: entity.location,
                    programs: entity.links.programs,
                    entity_id: entity._id,
                    comments: new Array<any>()
                }

                change.comments.push({
                    date: moment().format("YYYY-MM-DD @ h:mm a"),
                    user: currentUser.display_name,
                    action: "Created Standard Change",
                    description: ""
                })

                let result = await changeDb.create(change)

                return res.json({
                    data: result, messages: [{ text: "Change added", variant: "success" }]
                });
            }
            else {
                let change = req.body;
                change.entity_id = id;
                change.create_user = currentUser.display_name;
                change.create_date = new Date();
                change.status = "Open";
                change.comments = [];

                change.comments.push({
                    date: moment().format("YYYY-MM-DD @ h:mm a"),
                    user: currentUser.display_name,
                    action: "Created Change Request",
                    description: ""
                })

                let results = await requestDb.create(change);

                return res.json({
                    data: results, messages: [{ text: "Change request added", variant: "success" }]
                });
            }

        }

        res.status(404).send();
    });

entityRouter.get("/:id/request-change/:changeId", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const requestDb = req.store.ChangeRequests as GenericService;
        let { changeId } = req.params;

        let change = await requestDb.getById(changeId)

        if (change) {
            return res.json({ data: change });
        }

        res.status(404).send();
    });

entityRouter.put("/:id/request-change/:changeId", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const requestDb = req.store.ChangeRequests as GenericService;
        const changeDb = req.store.Changes as GenericService;
        let { id, changeId } = req.params;
        let { description, reason, status, title, comments } = req.body;
        let entity = await db.getById(id)
        let currentUser = (req.session as any).user;

        if (entity) {
            let change = await requestDb.getById(changeId)
            change.reason = reason;
            change.status = status;
            change.title = title;
            change.description = description;
            change.comments = comments;

            await buildConnections(entity, req);

            if (status == "Open") {

                let approveNames = change.comments
                    .filter((f: any) => f.action.indexOf("Approve") >= 0)
                    .map((f: any) => f.user);

                let requiredNames = [entity.location.approver_name];

                entity.links.programs.forEach((p: any) => {
                    requiredNames.push(p.approver_name);
                });

                let missingApprovals = new Array<any>();

                requiredNames.forEach((n) => {
                    if (approveNames.indexOf(n) == -1) missingApprovals.push(n);
                });

                if (missingApprovals.length == 0) {
                    change.status = "Approved";

                    let c1 = {
                        create_date: new Date(),
                        title,
                        status: "Open",
                        description,
                        reason,
                        request_id: changeId,
                        assigned_user: currentUser.display_name, // TODO: This should be current user 
                        complete_date: change.date,
                        location: entity.location,
                        programs: entity.links.programs,
                        entity_id: entity._id,
                        comments: new Array<any>()
                    }

                    c1.comments.push({
                        date: moment().format("YYYY-MM-DD"),
                        user: currentUser.display_name,
                        action: "Change Request fully approved",
                        description: ""
                    })

                    await requestDb.update(changeId, change);
                    let result = await changeDb.create(c1)

                    return res.json({
                        data: result, messages: [{ text: "Change added", variant: "success" }]
                    });
                }
            }

            let results = await requestDb.update(changeId, change);

            return res.json({
                data: results, messages: [{ text: "Change request updated", variant: "success" }]
            });
        }

        res.status(404).send();
    });

entityRouter.post("/:id/request-change/:changeId/approve",
    [param("id").notEmpty().isMongoId(),
    param("changeId").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const db = req.store.Entities as EntityService;
        const requestDb = req.store.ChangeRequests as GenericService;
        const changeDb = req.store.Changes as GenericService;
        let { id, changeId } = req.params;
        let { description, reason, title, date } = req.body;
        let entity = await db.getById(id);
        let currentUser = (req.session as any).user;

        if (entity) {
            let req = await requestDb.getById(changeId)
            req.reason = reason;
            req.status = "Approved";
            req.title = title;
            req.description = description;
            req.date = date;

            await requestDb.update(changeId, req);

            let change = {
                create_date: new Date(),
                title,
                status: "Open",
                description,
                reason,
                request_id: req._id,
                assigned_user: currentUser.display_name, // TODO: This should be current user 
                complete_date: date,
                location: entity.location,
                programs: entity.links.programs,
                entity_id: entity._id
            }

            let result = await changeDb.create(change)

            return res.json({
                data: result, messages: [{ text: "Change request updated", variant: "success" }]
            });
        }

        res.status(404).send();
    });

entityRouter.get("/:id/changes", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;
    let { id } = req.params;
    let entity = await db.getById(id)

    if (entity) {
        //await buildConnections(entity, req);

        let results = await changeDb.getAll({ entity_id: entity._id })

        return res.json({ data: results });
    }

    res.status(404).send();
});

entityRouter.get("/:id/complete-changes", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const db = req.store.Entities as EntityService;
    const changeDb = req.store.Changes as GenericService;
    let { id } = req.params;
    let entity = await db.getById(id)

    if (entity) {
        //await buildConnections(entity, req);

        let results = await changeDb.getAll({ entity_id: entity._id, status: "Complete" })

        return res.json({ data: results });
    }

    res.status(404).send();
});

entityRouter.put("/:id", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
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

entityRouter.delete("/:id", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let entity = await db.getById(id);

        if (entity) {
            // find all of the connections to this entity and remove them first
            let entityAttrIds = entity.attributes.map(a => a._id);
            let childLinks = await db.findDownLinks(entity._id);

            if (childLinks && childLinks.length > 0) {

                for (let link of childLinks) {
                    let childEntity = await db.getById(link._id);

                    if (childEntity) {
                        childEntity.links.entities = childEntity.links.entities.filter((e: any) => e.id != id);

                        for (let attr of childEntity.attributes) {
                            if (attr.source && attr.source.id && entityAttrIds.indexOf(attr.source.id) >= 0) {
                                delete attr.source;
                                delete (attr as any).oldName;
                            }
                        }

                        await db.update(childEntity._id, childEntity);
                    }
                }
            }

            const requestDb = req.store.ChangeRequests as GenericService;
            const changeDb = req.store.Changes as GenericService;

            let requests = await requestDb.getAll({ entity_id: id });
            let changes = await changeDb.getAll({ entity_id: id });

            for (let request of requests) {
                await requestDb.delete(request._id);
            }

            for (let change of changes) {
                await changeDb.delete(change._id);
            }
        }

        let results = await db.delete(id);

        return res.json({ messages: [{ variant: "success", text: "Entity deleted" }] });
    });

entityRouter.post("/:id/attribute", RequiresData, RequiresAuthentication,
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

            if (existing) {
                if (existing.length == 0) {
                    req.body._id = uuidV4();
                    entity.attributes.push(req.body);
                } else {
                    let aIndex = attributes.indexOf(existing[0]);
                    entity.attributes[aIndex] = req.body;
                }
            }
            let results = await db.update(id, entity);

            await buildConnections(entity, req);
            return res.json({ data: entity });
        }

        res.status(404).send();
    });

entityRouter.post("/:id/duplicate", RequiresData, RequiresAuthentication,
    [param("id").notEmpty().isMongoId(), body("name").notEmpty()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Entities as EntityService;
        let { id } = req.params;
        let { name } = req.body;
        let entity = await db.getById(id);

        if (entity) {
            let newEntity = _.clone(entity) as Entity;
            newEntity.name = name;
            delete newEntity._id;
            delete newEntity.id;
            newEntity = await db.create(req.user, newEntity);
            return res.json({ data: newEntity });
        }

        res.status(404).send();
    });

entityRouter.post("/:id/connection", RequiresData, RequiresAuthentication,
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

entityRouter.delete("/:id/connection/:connectionId", RequiresData, RequiresAuthentication,
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

entityRouter.get("/:id/attribute", RequiresData, RequiresAuthentication,
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

async function buildConnections(entity: Entity, req: Request) {
    const db = req.store.Entities as EntityService;
    const userDB = req.store.Persons as GenericService;
    const programDB = req.store.Programs as ProgramService;
    const locationDB = req.store.Locations as LocationService;
    const roleDB = req.store.Roles as GenericService;

    const allLocations = await locationDB.getAll({});

    if (entity.location) {
        entity.location.name = "Unknown";

        let location = allLocations.filter(l => l._id == entity.location.id)[0];// await locationDB.getById(entity.location.id);

        if (location) {
            entity.location.name = location.name;
            entity.location.type = location.type;
            entity.location.description = location.description;
            entity.location.change_approvers = new Array<any>();

            if (location.change_approver) {
                for (let r of location.change_approver) {
                    let role = await roleDB.getById(location.change_approver.toString());

                    if (role) {
                        let rpUsers = await userDB.getAll({ additional_roles: role._id.toString() })
                        role.members = rpUsers;
                        entity.location.change_approvers.push(role);
                    }
                }
            }
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
                let le = await db.getById(item.id);

                if (le) {
                    item.name = le.name;
                    item.attributes = le.attributes;
                    item.description = le.description;
                    item.status = le.status;
                    item.location = allLocations.filter(l => l._id == le?.location.id)[0];
                }
            }
        }

        if (entity.links.programs) {
            let toRemove = [];

            for (let item of entity.links.programs) {
                item.name = "Unknown";
                let program = await programDB.getById(item.id)

                if (program) {
                    item.name = program.name;
                    item.change_approvers = new Array<any>();

                    if (program.change_approver) {
                        for (let r of program.change_approver) {
                            let role = await roleDB.getById(r.toString());

                            if (role) {
                                let rpUsers = await userDB.getAll({ additional_roles: role._id.toString() })
                                role.members = rpUsers;
                                item.change_approvers.push(role);
                            }
                        }
                    }
                }
                else {
                    toRemove.push(item);
                }
            }

            for (let item of toRemove) {
                entity.links.programs.splice(entity.links.programs.indexOf(item), 1);
            }
        }

        let childLinks = await db.findDownLinks(entity._id);
        if (childLinks && childLinks.length > 0) {

            for (let item of childLinks) {
                item.location = allLocations.filter(l => l._id == item?.location.id)[0];
            }

            entity.links.downstream = childLinks;
        }
    }
    else {
        entity.links = { people: [], entities: [] };
    }
}
