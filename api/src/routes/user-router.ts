import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { AuthUser, Storage } from "../data";

export const userRouter = express.Router();

userRouter.get("/me", RequiresAuthentication, async (req: Request, res: Response) => {
    let currentUser = req.user as AuthUser;
    return res.json({ data: currentUser });
});

userRouter.get("/", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let db = req.store as Storage;

    let t = await db.Users.getUsers()

    return res.json({ data: t });
});

userRouter.post("/", RequiresData, async (req: Request, res: Response) => {
    let currentUser = req.user as AuthUser;
    let db = req.store as Storage;
    let newOne = await db.Users.makeUser(req.body)

    return res.json({ data: { result: newOne.result, newId: newOne.insertedId } });
});

userRouter.get("/:id", [param("id").notEmpty().isMongoId()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store as Storage;
        let { id } = req.params;

        let t = await db.Users.getUserById(id);
        return res.json({ data: t });
    });

userRouter.post("/search", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let { term } = req.body;
    let db = req.store as Storage;

    let t = await db.Users.search(term);
    return res.json({ data: t });
});
