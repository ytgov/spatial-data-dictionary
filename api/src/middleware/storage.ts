import { NextFunction, Request, Response } from "express";
import { Storage } from "../data";

const store = new Storage();

export async function RequiresData(req: Request, res: Response, next: NextFunction) {
    //   let store = new Storage();

    store.ensureConnected()
        .then(worked => {
            req.store = store;
            next();
        })
        .catch(error => {
            res.status(500).send("Cant connect to database");
        })
}
