import { MongoClient } from "mongodb";
import { MONGO_URL, MONGO_DB } from "../config";
import { AuthService, CategoryService, EntityService, GenericService, LocationService, ProgramService, SessionService, UserService } from "../services";
import { Entity } from "./entity";

export class Storage {
    mongoConnection!: MongoClient;
    isInitialized: boolean = false;

    Users!: UserService;
    Sessions!: SessionService;
    Entities!: EntityService;
    Categories!: CategoryService;
    Locations!: LocationService;
    Programs!: ProgramService;
    Domains!: GenericService;
    Persons!: GenericService;
    ChangeRequests!: GenericService;
    Changes!: GenericService;
    LocalUsers!: AuthService;
    EntityWatch!: GenericService;
    Roles!: GenericService;
    GraphData!: GenericService;
    Subscriptions!: GenericService;

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
                    this.Entities = new EntityService(this.mongoConnection.db(MONGO_DB).collection<Entity>("Entities"));
                    this.Categories = new CategoryService(this.mongoConnection.db(MONGO_DB).collection("Categories"));
                    this.Locations = new LocationService(this.mongoConnection.db(MONGO_DB).collection("Locations"));
                    this.Programs = new ProgramService(this.mongoConnection.db(MONGO_DB).collection("Programs"));
                    this.Domains = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Domains"));
                    this.Persons = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Persons"));
                    this.ChangeRequests = new GenericService(this.mongoConnection.db(MONGO_DB).collection("ChangeRequests"));
                    this.Changes = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Changes"));
                    this.LocalUsers = new AuthService(this.mongoConnection.db(MONGO_DB).collection("LocalUsers"));
                    this.EntityWatch = new GenericService(this.mongoConnection.db(MONGO_DB).collection("EntityWatch"));
                    this.Roles = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Roles"));
                    this.GraphData = new GenericService(this.mongoConnection.db(MONGO_DB).collection("GraphData"));
                    this.Subscriptions = new GenericService(this.mongoConnection.db(MONGO_DB).collection("Subscriptions"));
                    this.isInitialized = true;
                    resolve("Connected");
                })
                .catch(err => {
                    console.error("Can't connet to MongoDB @", MONGO_URL)
                    console.error(err);
                    reject(err);
                })
        })
    }

    isConnected() {
        return this.mongoConnection.isConnected();
    }
}
