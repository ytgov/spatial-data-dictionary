import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { UserService } from "../services";

export const userRouter = express.Router();

const userService = new UserService();

userRouter.post("/login",
    [body("username").notEmpty(),
    body("password").notEmpty()],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { username, password } = req.body;

        //return res.send({ data: {} });

        res.json({ errors: ["Authentication failed - Username or password is not correct"] });
    });

userRouter.get("/login-check", async (req: Request, res: Response) => {
    return res.json({ data: {} });
});

userRouter.post("/logout", async (req: Request, res: Response) => {
    res.status(200).send("Logout complete");
});
