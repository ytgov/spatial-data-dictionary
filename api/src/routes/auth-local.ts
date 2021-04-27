import express, { Express, Request, Response } from "express"
import * as ExpressSession from "express-session";
import { body, validationResult } from "express-validator";
import { RequiresData } from "../middleware";
import { FRONTEND_URL } from "../config";
import { AuthService } from "../services";

export const authLocalRouter = express.Router();

export function configureLocalAuthentication(app: Express) {
    app.use(ExpressSession.default({
        secret: 'supersecret',
        resave: true,
        saveUninitialized: true,
    }));

    authLocalRouter.get("/login", (req: Request, res: Response) => {
        res.redirect(302, `${FRONTEND_URL}/sign-in-local`);
    })

    authLocalRouter.get("/isAuthenticated", (req: Request, res: Response) => {
        let data = (req.session as any).user;

        if (data)
            return res.json({ data });

        res.status(401).send();
    })

    authLocalRouter.post("/login",
        [
            body("username").notEmpty(),
            body("password").notEmpty()
        ], RequiresData,
        async (req: Request, res: Response) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let db = req.store.LocalUsers as AuthService;
            let { username, password } = req.body;
            let s = req.session as any;
            let data = await db.login(username, password);

            if (data) {
                data.display_name = `${data.given_name} ${data.family_name}`
                s.user = data;
                req.session.save();

                return res.json({ data, messages: [{ variant: "success", text: "Sign in complete" }] })
            }

            res.json({ errors: [{ text: "Your username or password is incorrect" }] })
        })

    authLocalRouter.get("/logout", async (req: Request, res: Response) => {
        req.session.destroy(() => {
            res.json({ messages: [{ variant: "success", text: "Sign out complete" }] })
        });
    })

    authLocalRouter.post("/register",
        [
            body("username").notEmpty(),
            body("password").notEmpty(),
            body("given_name").notEmpty(),
            body("family_name").notEmpty(),
            body("email").isEmail().notEmpty()
        ], RequiresData, async (req: Request, res: Response) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let db = req.store.LocalUsers as AuthService;
            let { username, password, given_name, family_name, email } = req.body;
            let user = await db.create(username, password, given_name, family_name, email);

            res.json({ user })
        })

    authLocalRouter.get("/all", RequiresData, async (req: Request, res: Response) => {
        let db = req.store.LocalUsers as AuthService;
        res.json({ data: await db.getAll() })
    })

    app.use("/api/auth", authLocalRouter);

    app.get("/api/user/me", async (req: Request, res: Response) => {
        let data = (req.session as any).user;
        return res.json({ data })
    })
}