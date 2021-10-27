import { EntityService, GenericService, LocationService } from "../services";
import { Entity } from "../data/entity";
import { v4 as uuidv4 } from "uuid";

export class GraphBuilder {
    db: EntityService;
    locationDb: LocationService;
    graphDb: GenericService;
    searched: string[];

    nodes: any[];
    edges: any[];

    gotParentsFor: string[];
    gotChildrenFor: string[];

    positionData = { children: [] };

    constructor(db: EntityService, locationDb: LocationService, graphDb: GenericService) {
        this.db = db;
        this.locationDb = locationDb;
        this.graphDb = graphDb;

        this.searched = new Array<string>();
        this.nodes = new Array<any>();
        this.edges = new Array<any>();
        this.gotParentsFor = new Array<string>();
        this.gotChildrenFor = new Array<string>();
    }

    async BuildGraphForEntity(id: string): Promise<any> {
        this.nodes = new Array<any>();
        this.edges = new Array<any>();
        let entity = await this.loadEntity(id);

        let positions = await this.graphDb.getAll({ parent_id: id });

        if (positions.length > 0) {
            this.positionData = positions[0];
        }

        if (entity) {
            this.searched.push(`${entity._id}`);

            let ePos = this.positionData.children.filter((c: any) => c.child_id == entity?._id);
            let lPos = this.positionData.children.filter((c: any) => c.child_id == entity?.location.id);

            let eNode = { group: "nodes", data: { id: `${entity._id}`, label: entity.name, parent: `${entity.location.id}` }, classes: ["brown"] };
            let lNode = { group: "nodes", data: { id: `${entity.location.id}`, label: `${entity.location.name}` }, classes: ["red"] };

            if (ePos.length > 0)
                (eNode as any).position = { x: (ePos[0] as any).x, y: (ePos[0] as any).y };

            if (lPos.length > 0)
                (lNode as any).position = { x: (lPos[0] as any).x, y: (lPos[0] as any).y };

            this.nodes.push(eNode);
            this.nodes.push(lNode);

            await this.getParents(entity);
            await this.getChildren(entity);
        }

        return this.nodes
    }

    async loadEntity(id: string): Promise<Entity | undefined> {
        let entity = await this.db.getById(id);

        if (entity && entity.location) {
            entity.location.name = "Unknown";

            let location = await this.locationDb.getById(entity.location.id);

            if (location) {
                entity.location.name = location.name;
                entity.location.type = location.type;
                entity.location.description = location.description;
            }
        }

        return entity || undefined;
    }

    addNode(node: Entity) {
        let locId = `${node.location.id}`;
        let nodeId = `${node._id}`;
        let exists = this.nodes.filter(n => n.data.id == nodeId)

        if (exists.length == 0) {
            let newNode = { group: "nodes", data: { id: nodeId, label: node.name, parent: locId }, classes: [node.entity_type == "Domain table" ? "domain" : "blue"] };
            let ePos = this.positionData.children.filter((c: any) => c.child_id == nodeId);

            if (ePos.length > 0)
                (newNode as any).position = { x: (ePos[0] as any).x, y: (ePos[0] as any).y };

            this.nodes.push(newNode);
        }

        exists = this.nodes.filter(n => n.data.id == locId)

        if (exists.length == 0) {
            let newNode = { group: "nodes", data: { id: locId, label: node.location.name }, classes: ["red"] };
            let ePos = this.positionData.children.filter((c: any) => c.child_id == locId);

            if (ePos.length > 0)
                (newNode as any).position = { x: (ePos[0] as any).x, y: (ePos[0] as any).y };

            this.nodes.push(newNode);
        }
    }

    async getParents(entity: Entity): Promise<void> {
        let eId = `${entity._id}`;

        if (this.gotParentsFor.indexOf(eId) >= 0)
            return;

        this.gotParentsFor.push(eId)

        for (let parent of entity.links.entities) {
            let parentObj = await this.loadEntity(parent.id);

            if (parentObj) {
                this.addNode(parentObj)
                this.nodes.push({ group: "edges", data: { id: `${uuidv4()}`, target: eId, source: parent.id, arrow: "triangle-tee" } })

                await this.getParents(parentObj);

                //if (parentObj.entity_type != "Domain table")
                //await this.getChildren(parentObj);

                this.searched.push(`${parentObj._id}`)
            }
        }
    }

    async getChildren(entity: Entity,): Promise<void> {
        let eId = `${entity._id}`;

        if (this.gotChildrenFor.indexOf(eId) >= 0)
            return;

        this.gotChildrenFor.push(eId)
        let downLinks = await this.db.findDownLinks(eId);

        for (let parent of downLinks) {
            let parentObj = await this.loadEntity(parent._id);

            if (parentObj) {
                this.addNode(parentObj)
                this.nodes.push({ group: "edges", data: { id: `${uuidv4()}`, source: eId, target: `${parent._id}`, arrow: "vee" } })

                //await this.getParents(parentObj);
                
                //if (entity.entity_type != "Domain table")
                await this.getChildren(parentObj);
            }
        }
    }
}





