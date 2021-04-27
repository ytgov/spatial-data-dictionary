import { Collection, InsertOneWriteOpResult, ObjectID } from "mongodb";

export class UserService {

    private _people: Collection;

    constructor(people: Collection) {
        this._people = people;
    }

    async makeUser(document: any): Promise<InsertOneWriteOpResult<any>> {
        return this._people.insertOne(document);
    }

    async getUsers(): Promise<any> {
        return this._people.find().toArray();
    }

    async getUserById(id: string): Promise<any> {
        return this._people.findOne({ _id: new ObjectID(id) });
    }

    async getUserByEmail(email: string): Promise<any> {
        return this._people.findOne({ email });
    }

    async search(term: string): Promise<any> {
        return this._people.find(
            {
                $or: [
                    { name: { '$regex': new RegExp('' + term + ''), '$options': 'i' } },
                    { title: { '$regex': new RegExp('' + term + ''), '$options': 'i' }, }
                ]
            }
        ).toArray();
    }
}
