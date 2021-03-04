import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Entity, AuthUser } from "../data"

export class EntityService {

    private db: Collection<Entity>;

    constructor(db: Collection<Entity>) {
        this.db = db;
    }

    async create(user: AuthUser, entity: Entity): Promise<any> {
        return this.db.insertOne(entity);
    }

    async update(id: string, entity: Entity): Promise<any> {
        return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: entity });
    }

    async delete(id: string): Promise<any> {
        return this.db.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll(query?: FilterQuery<any>): Promise<Entity[]> {
        return this.db.find(query).toArray();
    }

    async getById(id: string): Promise<Entity | null> {
        try {
            return this.db.findOne<Entity>({ _id: new ObjectId(id) });
        }
        catch (e) { }

        return null;
    }

    async getByAttributeId(id: string): Promise<Entity | null> {
        try {
            return this.db.findOne<Entity>({ "attributes._id": id });
        }
        catch (e) { }

        return null;
    }

    async findDownLinks(id: string): Promise<any> {
        return this.db.find({ 'links.entities.id': new ObjectId(id) }).toArray();
    }
}
