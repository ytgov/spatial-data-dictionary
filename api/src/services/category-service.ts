import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Entity, AuthUser } from "../data"

export class CategoryService {

    private db: Collection;

    constructor(db: Collection) {
        this.db = db;
    }

    async create(item: any): Promise<any> {
        return this.db.insertOne(item);
    }

    async update(id: string, item: any): Promise<any> {
        return this.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: item });
    }

    async delete(id: string): Promise<any> {
        return this.db.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll(query?: FilterQuery<any>): Promise<any[]> {
        return this.db.find(query).toArray();
    }

    async getById(id: string): Promise<any | null> {
        try {
            return this.db.findOne<Entity>({ _id: new ObjectId(id) });
        }
        catch (e) { }

        return null;
    }
}
