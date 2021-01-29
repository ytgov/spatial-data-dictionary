import { MongoClient } from "mongodb";
import { MONGO_URL, MONGO_DB } from "../config";
import { SessionService, UserService } from "../services";

export class Storage {

    mongoConnection!: MongoClient;
    isInitialized: boolean = false;

    Users!: UserService;
    Sessions!: SessionService;

    constructor() {
    }

    async ensureConnected(): Promise<string> {
        if (this.isInitialized)
            return Promise.resolve("connected");

        return new Promise((resolve, reject) => {

            MongoClient.connect(MONGO_URL, { useUnifiedTopology: true, connectTimeoutMS: 3000, numberOfRetries: 2 })
                .then(resp => {
                    this.mongoConnection = resp;
                    this.Users = new UserService(this.mongoConnection.db(MONGO_DB).collection("People"));
                    this.Sessions = new SessionService(this.mongoConnection.db(MONGO_DB).collection("Sessions"));
                    this.isInitialized = true;
                    resolve("Connected");
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    isConnected() {
        return this.mongoConnection.isConnected();
    }
}
