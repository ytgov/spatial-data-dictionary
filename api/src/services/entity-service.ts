import { Collection, FilterQuery, ObjectId } from "mongodb";
import { Entity, AuthUser } from "../data"

export class EntityService {

    private db: Collection<Entity>;

    constructor(db: Collection<Entity>) {
        this.db = db;
    }

    async create(user: AuthUser, entity: Entity): Promise<any> {
        entity.create_user = user.display_name;
        entity.create_date = new Date();

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

            if (e.tags) {
                for (let tag of e.tags) {

                    if (tag.toLowerCase().indexOf(term) >= 0) {
                        e.search_reason = `Tag match (${tag})`;
                        matches.push(e)
                        continue;
                    }
                }
            }

            if (e.attributes) {
                for (let a of e.attributes) {
                    let attr = a.name.toLowerCase();

                    if (a.description)
                        attr += " " + a.description.toLowerCase();

                    if (a.type)
                        attr += " " + a.type.toLowerCase();

                    if (attr.indexOf(term) >= 0) {
                        e.search_reason = `Attribute match (${a.name})`;
                        matches.push(e);
                        break;
                    }

                    if (a.domain && a.domain.name) {
                        if (a.domain.name.toLowerCase().indexOf(term) >= 0) {
                            e.search_reason = `Domain match (${a.name})`;
                            matches.push(e);
                            break;
                        }
                    }
                }
            }

            if (e.properties) {
                for (let a of e.properties) {
                    let prop = a.name.toLowerCase() + " " + a.value.toLowerCase();

                    if (prop.indexOf(term) >= 0) {
                        e.search_reason = `Property match (${a.name})`;
                        matches.push(e);
                        break;
                    }
                }
            }
        }

        return matches;
    }
}
