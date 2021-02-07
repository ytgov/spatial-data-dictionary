import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Entity, AuthUser } from "../data"

export class EntityService {

    private db: Collection<Entity>;

    constructor(db: Collection<Entity>) {
        this.db = db;
    }

    async create(user: AuthUser, entity: Entity): Promise<any> {

        console.log("TRING TO INSERT", entity)

        return this.db.insertOne(entity);
    }

    async update(id: string, entity: Entity): Promise<any> {
        let old = await this.getById(id);

        console.log("FOUND: ", old)

        if (old) {
            return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: entity });
        }
    }

    async getAll(query?: FilterQuery<any>): Promise<Entity[]> {
        return this.db.find(query).toArray();
    }

    async getById(id: string): Promise<Entity | null> {
        try {
            let objId = new ObjectId(id)
            return this.db.findOne<Entity>({ _id: new ObjectId(id) });
        }
        catch (e) { }

        return null;
    }
}
