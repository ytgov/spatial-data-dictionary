import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AuthUser } from "../data";
import { UserService } from "../services";

export const userRouter = express.Router();

const userService = new UserService();

userRouter.get("/", async (req: Request, res: Response) => {
    let currentUser = req.user as AuthUser;

    return res.json({ data: currentUser });
});
