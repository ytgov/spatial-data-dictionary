import { Collection, InsertOneWriteOpResult, MongoClient, ObjectId } from "mongodb";
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

        this.mongoConnection = await MongoClient.connect("mongodb://admin:password@localhost:27017", { useUnifiedTopology: true });
        this.Users = new UserService(this.mongoConnection.db("People").collection("People"));
        this.Sessions = new SessionService(this.mongoConnection.db("People").collection("Sessions"));

        this.isInitialized = true;
    }

    isConnected() {
        return this.mongoConnection.isConnected();
    }
}
