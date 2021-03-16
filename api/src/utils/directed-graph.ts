import { EntityService } from "../services";
import { Entity } from "../data/entity";
import { v4 as uuidv4 } from "uuid";

export async function BuildGraphForEntity(db: EntityService, id: string): Promise<any> {
    console.log("BUILDENTITY GRPAH", id)

    let entity = await db.getById(id);

    if (entity) {
        let nodes = new Array();
        nodes.push({ group: "nodes", data: { id: `${entity._id}`, label: entity.name }, });
        console.log("ADDINGROOTNODE: ", { group: "nodes", data: { id: `${entity._id}`, label: entity.name } })

        nodes = await getParents(db, entity, nodes);

        return nodes;
    }

    return [];
}

async function getParents(db: EntityService, entity: Entity, nodes: any[]): Promise<any[]> {
    for (let parent of entity.links.entities) {
        let parentObj = await db.getById(parent.id);

        if (parentObj) {
            nodes.push({ group: "nodes", data: { id: `${parentObj._id}`, label: parentObj.name, type: "circle"  } })
            nodes.push({ group: "edges", data: { id: `${uuidv4()}`, source: `${entity._id}`, target: parent.id, arrow: "triangle-tee" } })

            nodes = await getParents(db, parentObj, nodes);
        }
    }

    return nodes;
}