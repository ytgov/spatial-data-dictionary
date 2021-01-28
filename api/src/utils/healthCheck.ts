import { Response } from "express";
import { DB_HOST, DB_NAME } from "../config";
import { UserService } from "../services";

const userService = new UserService();

export async function doHealthCheck(res: Response) {
    let dbConnected = await userService.isConnected()

    if (!dbConnected)
        return res.status(500).send(`Not able to connect to <strong>${DB_NAME}</strong> database on <strong>${DB_HOST}</strong>.`);

    res.send(`Connection to database on '<strong>${DB_HOST}</strong>' is connected and functioning.`);
}
