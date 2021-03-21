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
        return this.db.find({ 'links.entities.id': id.toString() }).toArray();
    }

    async search(term: string): Promise<Entity[]> {
        term = term.toLowerCase().trim();

        let all = await this.getAll();
        let matches = new Array<Entity>();

        for (let e of all) {
            let eName = e.name.toLowerCase();
            if (eName.indexOf(term) >= 0) {
                e.search_reason = "Name match";
                matches.push(e)
                continue;
            }

            let tags = "";
            if (e.tags)
                tags = e.tags.reduce((a, t) => { return a + " " + t.toLowerCase() })

            if (tags.indexOf(term) >= 0) {
                e.search_reason = "Tag match";
                matches.push(e)
                continue;
            }

            let attr = "";
            if (e.attributes) {
                for (let a of e.attributes) {
                    attr += " " + a.name.toLowerCase();

                    if (a.domain && a.domain.name) {
                        attr += " " + a.domain.name.toLowerCase();
                    }

                    if (attr.indexOf(term) >= 0) {
                        e.search_reason = `Attribute match (${a.name})`;
                        matches.push(e);
                        break;
                    }
                }
                console.log(attr)

            }
        }


        return matches;
    }
}
