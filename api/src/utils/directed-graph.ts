import { EntityService } from "../services";
import { Entity } from "../data/entity";
import { v4 as uuidv4 } from "uuid";

export class GraphBuilder {
    db: EntityService;
    searched: string[];

    nodes: any[];
    edges: any[];

    gotParentsFor: string[];
    gotChildrenFor: string[];

    constructor(db: EntityService) {
        this.db = db;
        this.searched = new Array<string>();
        this.nodes = new Array<any>();
        this.edges = new Array<any>();
        this.gotParentsFor = new Array<string>();
        this.gotChildrenFor = new Array<string>();
    }

    async BuildGraphForEntity(id: string): Promise<any> {
        this.nodes = new Array<any>();
        this.edges = new Array<any>();

        console.log("BUILDENTITY GRPAH", id)

        let entity = await this.db.getById(id);

        if (entity) {
            this.searched.push(`${entity._id}`);

            this.nodes.push({ group: "nodes", data: { id: `${entity._id}`, label: entity.name }, });
            console.log("ADDINGROOTNODE: ", { group: "nodes", data: { id: `${entity._id}`, label: entity.name } })

            await this.getParents(entity);
            await this.getChildren(entity);
        }

        return this.nodes
    }

    addNode(node: Entity) {
        let nodeId = `${node._id}`;
        let exists = this.nodes.filter(n => n.data.id == nodeId)

        if (exists.length == 0) {
            this.nodes.push({ group: "nodes", data: { id: nodeId, label: node.name } })
        }
    }

    async getParents(entity: Entity): Promise<void> {
        let eId = `${entity._id}`;

        if (this.gotParentsFor.indexOf(eId) >= 0)
            return;
            
        this.gotParentsFor.push(eId)
        console.log("Parents FOR " + entity.name)

        for (let parent of entity.links.entities) {
            let parentObj = await this.db.getById(parent.id);

            if (parentObj) {
                this.addNode(parentObj)
                this.nodes.push({ group: "edges", data: { id: `${uuidv4()}`, target: eId, source: parent.id, arrow: "triangle-tee" } })

                await this.getParents(parentObj);
                await this.getChildren(parentObj);

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

        console.log("CHILDREN FOR " + entity.name)

        for (let parent of downLinks) {
            let parentObj = await this.db.getById(parent._id);

            if (parentObj) {
                //console.log("WORKIN GON ", parentObj.name)
                this.addNode(parentObj)
                this.nodes.push({ group: "edges", data: { id: `${uuidv4()}`, source: eId, target: `${parent._id}`, arrow: "vee" } })

                await this.getParents(parentObj);
                await this.getChildren(parentObj);
            }
        }
    }
}





