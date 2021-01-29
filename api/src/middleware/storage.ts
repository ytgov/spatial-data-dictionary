import { NextFunction, Request, Response } from "express";
import { Storage } from "../data";

export async function RequiresData(req: Request, res: Response, next: NextFunction) {
    let store = new Storage();
    await store.ensureConnected();
    req.store = store;
    next();
}
