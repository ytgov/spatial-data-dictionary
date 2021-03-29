import { Collection} from "mongodb";
import { createHash } from "crypto";

export class AuthService {

    private db: Collection;

    constructor(users: Collection) {
        this.db = users;
    }

    async create(username: string, password: string, given_name: string, family_name: string, email: string): Promise<any> {
        let existing = await this.db.find({ email }).toArray();

        if (existing.length > 0)
            return undefined;

        let user = { username, given_name, family_name, email, password_hash: "", create_date: new Date(), is_active: true };
        user.password_hash = createHash("sha256").update(password).digest("hex");

        return await this.db.insertOne(user);
    }

    async login(username: string, password: string): Promise<any> {
        let password_hash = createHash("sha256").update(password).digest("hex");
        return this.db.findOne({ username, password_hash, is_active: true });
    }

    async disable(email: string): Promise<any> {
        return this.db.findOneAndUpdate({ email }, { is_active: false });
    }

    async enable(email: string): Promise<any> {
        return this.db.findOneAndUpdate({ email }, { is_active: true });
    }

    async getAll() {
        return this.db.find().toArray();
    }
}
