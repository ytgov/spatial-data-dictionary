import { MongoClient } from "mongodb";
import { MONGO_URL } from "../config";
import { SessionService, UserService } from "../services";

export class Storage {

    mongoConnection!: MongoClient;
    isInitialized: boolean = false;

    Users!: UserService;
    Sessions!: SessionService;

    constructor() {
    }

    async ensureConnected() {
        if (this.isInitialized)
            return;

        this.mongoConnection = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
        this.Users = new UserService(this.mongoConnection.db("People").collection("People"));
        this.Sessions = new SessionService(this.mongoConnection.db("People").collection("Sessions"));

        this.isInitialized = true;
    }

    isConnected() {
        return this.mongoConnection.isConnected();
    }
}
